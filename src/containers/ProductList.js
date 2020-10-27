import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
    Button,
    Container,
    Icon,
    Image,
    Item,
    Label,
    Segment,
    Dimmer,
    Loader,
    Message,
} from 'semantic-ui-react';
import { productListURL, addToCartURL } from '../constant';
import { authAxios } from '../utils';
import { fetchCart } from '../store/actions/cart';

const ProductList = (props) => {
    const [item, setData] = useState({
        loading: false,
        error: null,
        data: []
    })

    useEffect(() => {
        setData({ loading: true })
        axios.get(productListURL)
            .then(res => {
                setData({
                    data: res.data,
                    loading: false,
                })
            })
            .catch(error => {
                setData({
                    error: error,
                    loading: false
                })
            })
    }, [])

    const handleCart = (slug) => {
        setData({ loading: true })
        authAxios
            .post(addToCartURL, { slug })
            .then(res => {
                props.fetchCart();
                setData({
                    loading: false,
                })
            })
            .catch(error => {
                setData({
                    error: error,
                    loading: false
                })
            })
    }
    const { error, loading, data } = item

    return (
        <>
            <Container style={{ marginTop: "50px" }}>
                {error && (
                    <Message
                        error
                        header='There was some errors with your submission'
                        content={JSON.stringify(error)}
                    />

                )}
                {loading && (
                    <Segment  >
                        <Dimmer active inverted>
                            <Loader inverted content='Loading' />
                        </Dimmer>
                        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}

                <Item.Group divided>
                    {
                        data && data.map(item => {
                            return (
                                <Item key={item.id}>
                                    <Item.Image src={item.image} alt="itemImg" />
                                    <Item.Content>
                                        <Item.Header as='a' onClick={() => props.history.push(`/products/${item.id}`)} >{item.title}</Item.Header>
                                        <Item.Meta>
                                            <span className='cinema'>{item.category}</span>
                                        </Item.Meta>
                                        <Item.Description>{item.description}</Item.Description>
                                        <Item.Extra>
                                            {/* <Button primary floated='right' icon labelPosition="right" onClick={() => handleCart(item.slug)} >
                                                Add to cart
                                            <Icon name='cart plus' />
                                            </Button> */}
                                            {item.discount_price ? <Label
                                                color={item.label === 'primary' ? "blue"
                                                    : item.label === 'secondary' ? "red" :
                                                        "olive"}
                                            >{item.discount_price}</Label> : <label>{item.price}</label>
                                            }
                                        </Item.Extra>
                                    </Item.Content>
                                </Item>
                            )
                        })
                    }
                </Item.Group>
            </ Container>
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    };
};
export default connect(
    null,
    mapDispatchToProps
)(ProductList);