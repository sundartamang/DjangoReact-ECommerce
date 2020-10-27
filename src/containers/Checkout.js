import React, { useState } from 'react';
import { authAxios } from '../utils';
import { Link, withRouter } from 'react-router-dom';
import {
    checkoutURL,
    addCouponURL,
    orderSummaryURL,
    addressListURL,
} from '../constant';
import {
    CardElement,
    StripeProvider,
    Elements,
    injectStripe,
    // Loader,
} from 'react-stripe-elements';
import {
    Container,
    Button,
    Message,
    Item,
    Divider,
    Header,
    Label,
    Form,
    Select,
} from 'semantic-ui-react';

// This is CouponForm
const CouponForm = (props) => {
    const [item, setState] = useState({
        code: '',
    })
    const handleChange = (e) => {
        setState({
            code: e.target.value
        })
    }
    const handelSubmit = (e) => {
        const { code } = item
        props.handleAddCoupon(e, code)
    }

    return (
        <React.Fragment>
            <Form onSubmit={handelSubmit}>
                <Form.Field>
                    <label>Coupon code</label>
                    <input placeholder='Enter a coupon..' value={item.code} onChange={handleChange} />
                </Form.Field>
                <Button type='submit'>Submit</Button>
            </Form>
        </React.Fragment>
    )
}


// This is OrderPreview
const OrderPreview = (props) => {
    const { data } = props
    return (
        <React.Fragment>
            {data &&
                <React.Fragment>
                    <Item.Group relaxed>
                        {
                            data.order_items && data.order_items.map((order_item, i) => {
                                return (

                                    <Item key={i}>
                                        <Item.Image size='tiny' src={`http://127.0.0.1:8000${order_item.item.image}`} />

                                        <Item.Content verticalAlign='middle'>
                                            <Item.Header as='a'>{order_item.quantity} x {order_item.item.title}</Item.Header>
                                            <Item.Extra>
                                                <Label>{order_item.final_price}</Label>
                                            </Item.Extra>
                                        </Item.Content>
                                    </Item>

                                )
                            })
                        }
                    </Item.Group>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                                <Item.Header>
                                    Order total : $ {data.total}
                                    {data.coupon &&
                                        <Label ribbon color='green' style={{ marginLeft: "50px" }}>
                                            Current coupon {data.coupon.code} for {data.coupon.amount}
                                        </Label>

                                    }
                                </Item.Header>

                            </Item.Content>
                        </Item>
                    </Item.Group>
                </React.Fragment>
            }
        </React.Fragment >
    )
}



//This is CheckOutForm
class CheckoutForm extends React.Component {

    state = {
        loading: false,
        success: false,
        error: null,
        data: '',
        billingAddresses: [],
        shippingAddresses: [],
        selectedBillingAddress: '',
        selectedShippingAddress: '',
    }


    componentDidMount() {
        this.handleFetchOrder();
        this.handleFetchBillingAddress();
        this.handleFetchShippingngAddress();
    }

    handleGetDefaultAddress = addresses => {
        const filteredAddress = addresses.filter(el => el.default === true);
        if (filteredAddress.length > 0) {
            return filteredAddress[0].id;
        }
        return '';
    }

    // This function is to address data
    handleFetchBillingAddress = () => {
        this.setState({ loading: true })
        authAxios
            .get(addressListURL('B'))
            .then(res => {
                this.setState({
                    billingAddresses: res.data.map(a => {
                        return {
                            key: a.id,
                            text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
                            value: a.id
                        };
                    }),
                    selectedBillingAddress: this.handleGetDefaultAddress(res.data),
                    loading: false
                })
            })
            .catch(error => {
                this.setState({
                    error: error,
                    loading: false,
                })
            });
    }
    handleFetchShippingngAddress = () => {
        this.setState({ loading: true })
        authAxios
            .get(addressListURL('S'))
            .then(res => {
                this.setState({
                    shippingAddresses: res.data.map(a => {
                        return {
                            key: a.id,
                            text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
                            value: a.id
                        }
                    }),
                    selectedShippingAddress: this.handleGetDefaultAddress(res.data),
                    loading: false
                })
            })
            .catch(error => {
                this.setState({
                    error: error,
                    loading: false,
                })
            });
    }

    // This function is to fetch data
    handleFetchOrder = () => {
        this.setState({ loading: true })
        authAxios
            .get(orderSummaryURL)
            .then(res => {
                this.setState({
                    data: res.data,
                    loading: false
                })
            })
            .catch(error => {
                this.props.history.push('/products')
                this.setState({
                    error: error,
                    loading: false,
                })
            });
    }

    // This function is to add coupon
    handleAddCoupon = (e, code) => {
        e.preventDefault()
        this.setState({ loading: true })
        this.setState({
            loading: false,
        })
        authAxios.post(addCouponURL, { code })
            .then(res => {
                this.setState({
                    loading: false
                })
                this.handleFetchOrder();
            })
            .catch(error => {
                this.setState({
                    error: error,
                    loading: false
                })
            })
    }

    handleSelectChange = (e, { name, value }) => {
        this.setState({
            [name]: value
        })
    }

    // This function is to submit data
    submit = async (ev) => {
        ev.preventDefault()
        this.setState({ loading: true })
        if (this.props.stripe) {

            this.props.stripe.createToken().then(result => {
                if (result.error) {
                    this.setState({
                        error: result.error.message,
                        loading: false
                    })
                } else {
                    this.setState({ error: null })
                    const { selectedBillingAddress, selectedShippingAddress } = this.state

                    authAxios.post(checkoutURL, {
                        stripeToken: result.token.id,
                        selectedBillingAddress,
                        selectedShippingAddress
                    })
                        .then(res => {
                            this.setState({
                                loading: false,
                                success: true,
                            })
                        })
                        .catch(error => {
                            this.setState({
                                error: error,
                                loading: false
                            })
                        })
                }
            })
        } else {
            console.log("Stripe not loaded successfully")
        }
    }
    render() {
        const {
            data,
            error,
            loading,
            success,
            billingAddresses,
            shippingAddresses,
            selectedBillingAddress,
            selectedShippingAddress
        } = this.state

        return (
            <Container style={{ height: "auto", minHeight: "300px" }}>
                {error && (
                    <Message
                        error
                        header='There was some errors with your submission'
                        content={JSON.stringify(error)}
                    />

                )}
                {/* 
                {success &&
                    <Message positive>
                        <Message.Header>Your payment aas successfull.</Message.Header>
                        <p>
                            Go to your <b>profile</b> to see the order deliever status.
                    </p>
                    </Message>
                } */}


                <OrderPreview data={data} />
                <Divider />
                <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />
                <Divider />
                <Header>Select a billing address</Header>
                {billingAddresses.length > 0 ?
                    <Select
                        name="selectedBillingAddress"
                        value={selectedBillingAddress}
                        clearable
                        options={billingAddresses}
                        selection
                        onChange={this.handleSelectChange}
                    /> :
                    <p>You need to <Link to="/profile">add a billing address</Link></p>
                }

                <Header>Select a shipping address</Header>
                {shippingAddresses.length > 0 ?
                    <Select
                        name="selectedShippingAddress"
                        value={selectedShippingAddress}
                        clearable
                        options={shippingAddresses}
                        selection
                        onChange={this.handleSelectChange}
                    /> :
                    <p>You need to <Link to="/profile">add ashipping address</Link></p>
                }
                <Divider />

                { shippingAddresses.length < 1 || billingAddresses.length < 1 ?
                    <p>You need to address before you complete purchase.</p>

                    :
                    <React.Fragment>
                        <Header>Would you like to purchase ?</Header>
                        <CardElement />
                        {success &&
                            <Message positive>
                                <Message.Header>Your payment was successfull.</Message.Header>
                                <p>
                                    Go to your <b>profile</b> to see the order deliever status.
                                </p>
                            </Message>
                        }
                        <Button
                            loading={loading}
                            disabled={loading}
                            primary
                            onClick={this.submit}
                            style={{ marginTop: "10px" }}
                        >Submit</Button>
                    </React.Fragment>
                }
            </Container>
        );
    }
};
const InjectedForm = withRouter(injectStripe(CheckoutForm));
const WrapperForm = () => (
    <StripeProvider apiKey="pk_test_51HUlXxEzKlBswADYWP81sxUEbRAkCmYDb0GxU3X8j1Nada7K6gRcAR9FkcMEr6A3hUHz7Me2HpMNDuxhVkFYkzWC009X1GhCy8">
        <div>
            <h1>Complete your order </h1>
            <Elements>
                <InjectedForm />
            </Elements>
        </div>
    </StripeProvider >
);
export default WrapperForm;