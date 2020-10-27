import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux'
import {
    Button,
    Container,
    Header,
    Label,
    Table,
    Loader,
    Message,
    Dimmer,
    Segment,
    Image,
    Icon
} from 'semantic-ui-react'
import { authAxios } from '../utils'
import {
    orderSummaryURL,
    oderItemDeleteURL,
    addToCartURL,
    oderItemUpdateQuantityURL
} from '../constant'

const OrderSummary = (props) => {
    const [item, setItem] = useState({
        loading: false,
        error: null,
        data: []
    })
    useEffect(() => {
        handleFetchOrder()
    }, [])

    // it will return two variation to us size and color
    const handleFormatData = (itemVariations) => {
        //covert [{id:1}{id:2}] to [1,2] =>they are all variations
        return Object.keys(itemVariations).map(key => {
            return itemVariations[key].id;
        })
    }

    const handleaddToCart = (slug, itemVariations) => {
        setItem({ loading: true })
        const variations = handleFormatData(itemVariations);
        authAxios
            .post(addToCartURL, { slug, variations })
            .then(res => {
                handleFetchOrder();
                setItem({
                    loading: false,
                })
            })
            .catch(error => {
                setItem({
                    error: error,
                    loading: false
                })
            })
    }

    const handleFetchOrder = () => {
        setItem({ loading: true })
        authAxios
            .get(orderSummaryURL)
            .then(res => {
                setItem({
                    data: res.data,
                    loading: false
                })
            })
            .catch(err => {
                setItem({
                    err: err,
                    loading: false,
                })
                // if (err.response.status === 404) {
                //     setItem({
                //         err: "you do not have rder currrently",
                //         loading: false,
                //     })
                // } else {
                //     setItem({
                //         err: err,
                //         loading: false,
                //     })
                // }
            });
    }
    const renderVariations = (orderItem) => {
        let text = '';
        orderItem.item_variations.forEach(iv => {
            text += `${iv.variation.name} : ${iv.value}`
        })
        return text;
    }

    const handleRemoveItem = (itemID) => {
        authAxios.delete(oderItemDeleteURL(itemID))
            .then(res => {
                handleFetchOrder();
            })
            .catch(err => {
                setItem({
                    err: err,
                })
            });
    }

    const handleRemoveQuantityFromCart = slug => {
        authAxios.post(oderItemUpdateQuantityURL, { slug })
            .then(res => {
                handleFetchOrder();
            })
            .catch(err => {
                setItem({
                    err: err,
                })
            });

    }


    const { data, error, loading } = item
    const { isAuthenticated } = props

    if (!isAuthenticated) {
        return <Redirect to='/login' />
    }
    return (
        <Container style={{ marginTop: "50px" }}>
            <Header as="h3">Order summary</Header>
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
            {data &&
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Item # </Table.HeaderCell>
                            <Table.HeaderCell>Item name</Table.HeaderCell>
                            <Table.HeaderCell>Item price</Table.HeaderCell>
                            <Table.HeaderCell>Item quantity</Table.HeaderCell>
                            <Table.HeaderCell>Total item price</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            data.order_items && data.order_items.map((order_item, i) => {
                                return (
                                    <Table.Row key={order_item.id}>
                                        <Table.Cell>
                                            {i}
                                        </Table.Cell>
                                        <Table.Cell>{order_item.item.title} - {renderVariations(order_item)}</Table.Cell>
                                        <Table.Cell>
                                            ${
                                                order_item.item.discount_price ?
                                                    order_item.item.discount_price
                                                    :
                                                    order_item.item.price
                                            }
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Icon
                                                name="minus"
                                                style={{ float: "left", cursor: "pointer" }}
                                                onClick={() => handleRemoveQuantityFromCart(
                                                    order_item.item.slug
                                                )}
                                            />
                                            {order_item.quantity}
                                            <Icon
                                                name="plus"
                                                style={{ float: "right", cursor: "pointer" }}
                                                onClick={() => handleaddToCart(
                                                    order_item.item.slug,
                                                    order_item.item_variations
                                                )}
                                            />

                                        </Table.Cell>
                                        <Table.Cell>
                                            {order_item.item.discount_price &&
                                                <Label ribbon color='green'>On Discount</Label>

                                            }
                                            $ {order_item.final_price}
                                            <Icon
                                                name="trash"
                                                color="red"
                                                style={{ float: "right", cursor: "pointer" }}
                                                onClick={() => handleRemoveItem(order_item.id)}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                        <Table.Row>
                            <Table.Cell />
                            <Table.Cell />
                            <Table.Cell />
                            <Table.Cell colSpan='2' textAlign='center'>
                                Total : $ {data.total}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='5' textAlign='right'>
                                <Link to="/checkout">
                                    <Button color="yellow">Checkout</Button>
                                </Link>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            }
        </Container >
    );
};
const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null,
    }
}
export default connect(mapStateToProps)(OrderSummary);