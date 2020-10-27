import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import {
    Button,
    Container,
    Select,
    Icon,
    Image,
    Item,
    Grid,
    Header,
    Label,
    Form,
    Segment,
    Dimmer,
    Divider,
    Loader,
    Message,
    Card,
} from 'semantic-ui-react';
import { productDetailURL, addToCartURL } from '../constant';
import { authAxios } from '../utils';
import { fetchCart } from '../store/actions/cart';

class ProductDetail extends React.Component {

    state = {
        loading: false,
        error: null,
        formVisible: false,
        data: [],
        formData: {}
    }

    componentDidMount() {
        this.handleFetchItem()
    }

    handleToggleForm = () => {
        const { formVisible } = this.state
        this.setState({
            formVisible: !formVisible
        })
    }

    handleFetchItem = () => {
        const { match: { params } } = this.props

        this.setState({ loading: true })
        axios.get(productDetailURL(params.productID))
            .then(res => {
                this.setState({
                    data: res.data,
                    loading: false,
                })
            })
            .catch(error => {
                this.setState({
                    error: error,
                    loading: false
                })
            })
    }

    handleFormatData = (formData) => {
        //covert {color:1,size:2} to [1,2] =>they are all variations
        return Object.keys(formData).map(key => {
            return formData[key];
        })
    }

    handleaddToCart = (slug) => {
        this.setState({ loading: true })
        const { formData } = this.state
        const variations = this.handleFormatData(formData);

        authAxios
            .post(addToCartURL, { slug, variations })
            .then(res => {
                this.props.refreshCart();
                this.setState({
                    loading: false,
                })
            })
            .catch(error => {
                this.setState({
                    error: error,
                    loading: false
                })
            })
    }

    handleChange = (e, { name, value }) => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            [name]: value
        }
        this.setState({
            formData: updatedFormData
        })

    }

    render() {
        const { data, error, formData, loading, formVisible } = this.state
        const item = data

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
                    <Grid columns={2} relaxed='very'>
                        <Grid.Column>

                            <Card
                                fluid
                                image={item.image}
                                header={item.title}
                                meta={(
                                    <React.Fragment>
                                        {item.category}
                                        {item.discount_price ? <Label
                                            color={item.label === 'primary' ? "blue"
                                                : item.label === 'secondary' ? "red" :
                                                    "olive"}
                                        >$ {item.discount_price}</Label> : <label>{item.price}</label>
                                        }
                                    </React.Fragment>

                                )}
                                description={item.description}
                                extra={(
                                    <React.Fragment>
                                        <Button
                                            color='yellow'
                                            fluid
                                            icon labelPosition="right"
                                            onClick={this.handleToggleForm} >
                                            Add to cart
                                        <Icon name='cart plus' />
                                        </Button>
                                    </React.Fragment>
                                )}
                            />

                            {formVisible && (
                                <React.Fragment>
                                    <Divider />
                                    <Form>
                                        {data.variations.map(v => {
                                            const name = v.name.toLowerCase();
                                            return (
                                                <Form.Field key={v.id}>
                                                    <Select
                                                        name={name}
                                                        onChange={this.handleChange}
                                                        options={v.item_variations.map(item => {
                                                            return {
                                                                key: item.id,
                                                                text: item.value,
                                                                value: item.id

                                                            }
                                                        })}
                                                        placeholder={`Choose a ${name}`}
                                                        selection
                                                        value={formData[name]}
                                                    />
                                                </Form.Field>
                                            )
                                        })}

                                        <Form.Button
                                            primary
                                            onClick={() => this.handleaddToCart(item.slug)}>
                                            Submit
                                        </Form.Button>
                                    </Form>
                                </React.Fragment>
                            )}

                        </Grid.Column>
                        <Grid.Column>
                            <Header as="h2">Try different variations</Header>
                            {data &&
                                data.variations &&
                                data.variations.map(v => {
                                    return (
                                        <React.Fragment key={v.id}>
                                            <Header as="h3">{v.name}</Header>
                                            <Item.Group divided>
                                                {v.item_variations.map(iv => {
                                                    return (
                                                        <Item key={iv.id}>
                                                            {iv.attachment && (
                                                                <Item.Image
                                                                    size='tiny'
                                                                    src={` http://127.0.0.1:8000${iv.attachment}`}
                                                                />
                                                            )}
                                                            <Item.Content
                                                                verticalAlign='middle'>
                                                                {iv.value}
                                                            </Item.Content>
                                                        </Item>
                                                    )
                                                })}
                                            </Item.Group>
                                        </React.Fragment>
                                    );
                                })
                            }
                        </Grid.Column>
                    </Grid>
                </ Container>
            </>
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    };
};
export default withRouter(connect(
    null,
    mapDispatchToProps
)(ProductDetail));