import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import {
    Header,
    Grid,
    Divider,
    Menu,
    Form,
    Loader,
    Message,
    Segment,
    Image,
    Dimmer,
    Select,
    Card,
    Label,
    Button,
    Table
} from "semantic-ui-react";
import {
    addressListURL,
    addressCreateURL,
    countryListURL,
    userIDURL,
    addressUpdateURL,
    addressDeleteURL,
    paymentListURL
} from '../constant';
import { authAxios } from '../utils';

const UPDATE_FORM = "UPDATE_FORM"
const CREATE_FORM = "CREATE_FORM"

const PaymentHistory = () => {
    const [state, setState] = useState({
        loading: false,
        error: null,
        payments: []
    })
    useEffect(() => {
        handleFetchPayment()
    }, [])

    const handleFetchPayment = () => {
        setState({ loading: true })
        authAxios.get(paymentListURL)
            .then(res => {
                setState({
                    payments: res.data,
                    loading: false
                })
            })
            .catch(err => {
                setState({
                    error: err,
                    loading: false
                })
            })
    }
    const { payments } = state
    console.log("payment: ", payments)
    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>S.N.</Table.HeaderCell>
                    <Table.HeaderCell>Amount</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {payments && payments.map(p => {
                    return (
                        <Table.Row key={p.id}>
                            <Table.Cell>
                                <Label ribbon>{p.id}</Label>
                            </Table.Cell>
                            <Table.Cell>$ {p.amount}</Table.Cell>
                            <Table.Cell>{new Date(p.timestamp).toUTCString()}</Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table>
    )
}


class AddressForm extends React.Component {
    state = {
        loading: false,
        error: null,
        success: false,
        saving: false,
        formData: {
            address_type: "",
            apartment_address: "",
            country: "",
            id: "",
            street_address: "",
            user: 1,
            zip: "",
            default: false
        },
    }

    componentDidMount() {
        const { address, formType } = this.props

        if (formType === UPDATE_FORM) {
            this.setState({ formData: address }, () => {
                console.log(this.state)
            })
        }
    }

    // This function is for handling the chaged in checkbox
    handleToggleDefault = () => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            default: !formData.default
        }
        this.setState({
            formData: updatedFormData
        })
    }

    // This funciton is for handling the change in input field
    handleChange = (event) => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            [event.target.name]: event.target.value
        }
        this.setState({
            formData: updatedFormData
        })
    }

    // This function is for handling the selected input change like countries
    handleSelectChange = (event, { name, value }) => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            [name]: value
        }
        this.setState({
            formData: updatedFormData
        })
    }

    handleSubmit = (event) => {
        this.setState({ saving: true })
        event.preventDefault()
        const { formType } = this.props

        if (formType === UPDATE_FORM) {
            this.handleUpdateAddress();
        } else {
            this.handleCreateAddress();
        }
    }

    // This function is for creating address
    handleCreateAddress = () => {
        const { userID, activeItem } = this.props
        const { formData } = this.state

        authAxios.post(addressCreateURL, {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
        })
            .then(res => {
                this.setState({
                    saving: false,
                    success: true,
                    formData: {
                        default: false
                    }
                })
                this.props.callback()
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    // This function is for updating data
    handleUpdateAddress = () => {
        const { userID, activeItem } = this.props
        const { formData } = this.state

        authAxios.put(addressUpdateURL(formData.id), {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
        })
            .then(res => {
                this.setState({
                    saving: false,
                    success: true,
                    formData: {
                        default: false
                    }
                })
                this.props.callback()
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    render() {
        const { countries } = this.props
        const { error, success, saving, formData } = this.state

        return (
            <Form onSubmit={this.handleSubmit} success={success} error={error}>
                <Form.Input
                    required
                    name="street_address"
                    placeholder="Street address"
                    onChange={this.handleChange}
                    value={formData.street_address}

                />
                <Form.Input
                    required
                    name="apartment_address"
                    placeholder="Apartment address"
                    onChange={this.handleChange}
                    value={formData.apartment_address}

                />
                <Form.Field required>
                    <Select
                        fluid
                        clearable
                        search
                        name="country"
                        options={countries}
                        placeholder="Country"
                        onChange={this.handleSelectChange}
                        value={formData.country}

                    />
                </Form.Field>
                <Form.Input
                    required
                    name="zip"
                    placeholder="Street address"
                    onChange={this.handleChange}
                    value={formData.zip}
                />
                <Form.Checkbox
                    name="default"
                    label="Make this default address"
                    onChange={this.handleToggleDefault}
                    checked={formData.default}
                />
                {success &&
                    <Message
                        success
                        header="Success !"
                        content="Your address was saved"
                    />
                }
                {error && (
                    <Message
                        error
                        header='There was an error'
                        content={JSON.stringify(error)}
                    />

                )}
                <Form.Button
                    disabled={saving}
                    loading={saving} primary
                >Save</Form.Button>
            </Form>
        )
    }
}


class Profile extends React.Component {
    state = {
        activeItem: "billingAddress",
        addresses: [],
        userID: null,
        countries: [],
        selectedAddress: null
    }

    // To handle selected address, it will store address into seletedAdress 
    handleSelectAddress = (address) => {
        console.log(address)
        this.setState({ selectedAddress: address })
    }

    componentDidMount() {
        this.handleFetchAddresses()
        this.handleFetchCountries()
        this.handleFetchUserID()
    }

    handleGetActiveItem = () => {
        const { activeItem } = this.state
        if (activeItem === 'billingAddress') {
            return "Billing Address"
        } else if (activeItem === 'shippingAddress') {
            return "Shipping Address"
        } else {
            return "Payment History"
        }

    }

    // To delete address
    handleDeleteAddress = (addressID) => {
        authAxios.delete(addressDeleteURL(addressID))
            .then(res => {
                this.handleCallBack()
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    // Callback function used to fetch address after update and delete data
    handleCallBack = () => {
        this.handleFetchAddresses()
        this.setState({ selectedAddress: null })
    }

    // Fetch address
    handleFetchAddresses = () => {
        this.setState({ loading: true })
        const { activeItem } = this.state
        authAxios.get(addressListURL(activeItem === 'billingAddress' ? 'B' : 'S'))
            .then(res => {
                this.setState({
                    addresses: res.data,
                    loading: false
                })
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    // Handle countries format
    handleFormatCountries = (countries) => {
        const keys = Object.keys(countries)
        return keys.map(k => {
            return {
                key: k,
                text: countries[k],
                value: k
            }
        })
    }

    // Fetch Countries
    handleFetchCountries = () => {
        authAxios.get(countryListURL)
            .then(res => {
                this.setState({
                    countries: this.handleFormatCountries(res.data)
                })
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    // Fetch user ID
    handleFetchUserID = () => {
        authAxios.get(userIDURL)
            .then(res => {
                console.log(res.data)
                this.setState({
                    userID: res.data.userID
                })
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    // To fetch addess type like is it shipping address of billing address
    handleItemClick = (name) => {
        this.setState({ activeItem: name }, () => {
            this.handleFetchAddresses()
        })
    }

    renderAddresses() {
        const {
            activeItem,
            addresses,
            countries,
            selectedAddress,
            userID
        } = this.state
        return (
            <React.Fragment>
                <Card.Group>
                    {addresses &&
                        addresses.map(a => {
                            return (
                                <Card key={a.id} fluid>
                                    <Card.Content>
                                        {a.default &&
                                            <Label as='a' color='blue' ribbon="right">
                                                Default
                                                    </Label>
                                        }
                                        <Card.Header>{a.street_address}, {a.apartment_address}</Card.Header>
                                        <Card.Meta>{a.country}</Card.Meta>
                                        <Card.Description>
                                            {a.zip}
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div className='ui two buttons'>
                                            <Button
                                                color='green'
                                                onClick={() => this.handleSelectAddress(a)}
                                            >
                                                Update
                                                    </Button>
                                            <Button
                                                color='red'
                                                onClick={() => this.handleDeleteAddress(a.id)}
                                            >
                                                Delete
                                                    </Button>
                                        </div>
                                    </Card.Content>
                                </Card>
                            )
                        })
                    }
                </Card.Group>
                {addresses.length > 0 ?
                    < Divider /> : null
                }
                {selectedAddress === null ? (
                    <AddressForm
                        activeItem={activeItem}
                        countries={countries}
                        formType={CREATE_FORM}
                        callback={this.handleCallBack}
                        userID={userID}
                    />) : null}
                {selectedAddress &&
                    <AddressForm
                        activeItem={activeItem}
                        userID={userID}
                        countries={countries}
                        address={selectedAddress}
                        formType={UPDATE_FORM}
                        callback={this.handleCallBack}
                    />
                }
            </React.Fragment>
        )
    }

    render() {
        const {
            activeItem,
            error,
            loading,
        } = this.state
        const { isAuthenticated } = this.props

        console.log("isAuthenticated = ", isAuthenticated)

        if (!isAuthenticated) {
            return <Redirect to='/login' />
        }
        return (
            <Grid container columns={2} style={{ marginTop: "50px" }}>
                <Grid.Row columns={1}>
                    <Grid.Column>
                        {error && (
                            <Message
                                error
                                header='There was an error'
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
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}>
                        <Menu pointing vertical fluid>
                            <Menu.Item
                                name='Billing Address'
                                active={activeItem === 'billingAddress'}
                                onClick={() => this.handleItemClick('billingAddress')}
                            />
                            <Menu.Item
                                name='Shipping Address'
                                active={activeItem === 'shippingAddress'}
                                onClick={() => this.handleItemClick('shippingAddress')}
                            />
                            <Menu.Item
                                name='Payment history'
                                active={activeItem === 'paymentHistory'}
                                onClick={() => this.handleItemClick('paymentHistory')}
                            />
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Header>
                            {this.handleGetActiveItem()}
                        </Header>
                        <Divider />
                        {activeItem === "paymentHistory" ?
                            (
                                <PaymentHistory />
                            )
                            :
                            (this.renderAddresses())
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid >
        );
    }
};

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null,
    }
}
export default connect(mapStateToProps)(Profile);