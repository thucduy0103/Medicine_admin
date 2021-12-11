import React, { Component } from 'react'
import MyFooter from '../../MyFooter/MyFooter'
import { connect } from 'react-redux'
import callApi from '../../../utils/apiCaller';
import { actAddOrderRequest, actGetOrderRequest, actEditOrderRequest } from '../../../redux/actions/order';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
let token;
let id;

class ActionOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      address: '',
      phone: '',
      totalAmount: 0,
      shippingTotal: 0,
      shippingUnit : '',
      status: 'Unconfirm',
      statusString: '',
      code: 0,
      redirectToOrder: false,
      dataOrderDetails: []
    };
    id = this.props.id
  }

  async componentDidMount() {
    token = localStorage.getItem('_auth');
    if (id) {
      const res = await callApi(`orders/get-order?orderId=${id}`, 'GET', null, token);
      this.setState({
        fullName: res.data.receiverName,
        note: res.data.note,
        phone: res.data.phoneNumber,
        address: res.data.addressDelivery,
        totalAmount: res.data.totalAmount,
        shippingTotal: res.data.shippingTotal,
        shippingUnit : res.data.shippingUnit,
        status: res.data.orderStatus,
        statusString: res.data.orderStatusString,
        code: res.data.id,
        dataOrderDetails: res.data.listCart
      })
    } else {

    }
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({
      redirectToOrder: true
    })
  }

  sumTotal = (itemAmount, shippingTotal, promoTotal) => {
    const newitemAmount = itemAmount ? itemAmount : 0;
    const newShippingTotal = shippingTotal ? shippingTotal : 0;
    const newpPomoTotal = promoTotal ? promoTotal : 0;

    const result = parseInt(newitemAmount) + parseInt(newShippingTotal) - parseInt(newpPomoTotal);
    if (result < 0) {
      return toast.error('ERROR! Total amount can not < 0');
    }
    return result;
  }

  render() {
    const { dataOrderDetails, fullName, address, code, phone, totalAmount, shippingTotal, shippingUnit, status,statusString, redirectToOrder } = this.state;
    let orderDetailAmount = 0;
    if (dataOrderDetails.length > 0) {
      orderDetailAmount = dataOrderDetails.reduce((sum, item) => {
        return sum += item.quantity * item.price
      }, 0)
    }
    if (redirectToOrder) {
      return <Redirect to='/orders'></Redirect>
    }
    return (
      <div className="content-inner">
        {/* Page Header*/}
        <header className="page-header">
          <div className="container-fluid">
            <h2 className="no-margin-bottom">Form Order</h2>
          </div>
        </header>
        {/* Breadcrumb*/}
        <div className="breadcrumb-holder container-fluid">
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="index.html">Home</a></li>
            <li className="breadcrumb-item active">Order</li>
          </ul>
        </div>
        {/* Forms Section*/}
        <section className="forms">
          <div className="container-fluid">
            <div className="row">
              {/* Form Elements */}
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header d-flex align-items-center">
                    <h3 className="h4">Descriptions</h3>
                  </div>
                  <div className="card-body">
                    <form className="form-horizontal" onSubmit={(event) => this.handleSubmit(event)} >
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Name Reciver</label>
                        <div className="col-sm-9">
                          <input disabled name="fullName" value={fullName} onChange={this.handleChange} type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Address</label>
                        <div className="col-sm-3">
                          <input disabled name="address" value={address} onChange={this.handleChange} type="text" className="form-control" />
                        </div>
                        <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Phone</label>
                        <div className="col-sm-3">
                          <input disabled name="phone" value={phone} onChange={this.handleChange} type="text" className="form-control" />
                        </div>
                      </div>
                      {
                        id ? <div>
                       <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label" style={{paddingTop: 50}}>Items</label>
                        <div className="col-sm-9">
                        <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Number</th>
                            <th>Product</th>
                            <th>Image</th>
                            <th>Quantity</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataOrderDetails && dataOrderDetails.length ? dataOrderDetails.map((item, index) => {
                            return (
                              <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{item.productName}</td>
                                <td>
                                  <div className="fix-cart">
                                    <img src={item.image ? item.image : null} className="fix-img" alt="not found" />
                                  </div>
                                </td>
                                <td>{item.quantity}</td>
                                <td>{item.quantity * item.price}</td>
                              </tr>
                            )
                          }) : null}
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><b style={{fontSize: 16}}>Item Amount: </b></td>
                        <td><b style={{fontSize: 16}}>${orderDetailAmount}</b></td>
                        </tbody>
                      </table>
                    </div>
                  </div>
                        </div>
                      </div>
                          <div className="line" />
                          <div className="form-group row">
                            <label className="col-sm-3 form-control-label">Code Order</label>
                            <div className="col-sm-3">
                              <input disabled value={code} type="text" disabled className="form-control" />
                            </div>
                            <label className="col-sm-3 form-control-label">Shipping Unit</label>
                            <div className="col-sm-3">
                              <input name="itemAmount" disabled value={shippingUnit} onChange={this.handleChange} type="number" className="form-control" />
                            </div>
                          </div>
                          <div className="line" />
                          <div className="form-group row">
                            <label className="col-sm-3 form-control-label">Shipping Total</label>
                            <div className="col-sm-3">
                              <input name="shippingTotal" disabled value={shippingTotal} onChange={this.handleChange} type="number" className="form-control" />
                            </div>
                            <label className="col-sm-3 form-control-label">Total Amount</label>
                            <div className="col-sm-3">
                              <input disabled name="totalAmount" value={totalAmount} onChange={this.handleChange} type="number" className="form-control" />
                            </div>
                          </div>
                          <div className="line" />
                        </div>
                          :
                          <div>
                          <div className="line" />
                          <div className="form-group row">
                            <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Shipping Total</label>
                            <div className="col-sm-3">
                              <input name="shippingTotal" value={shippingTotal} onChange={this.handleChange} type="number" className="form-control" />
                            </div>
                          </div>
                          <div className="line" />
                          <div className="form-group row">
                            <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Total Amount</label>
                            <div className="col-sm-3">
                              <input name="totalAmount" value={totalAmount} onChange={this.handleChange} type="number" className="form-control" />
                            </div>
                          </div>
                          </div>
                      }
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Status</label>
                        <div className="col-sm-3">
                          <input disabled name="status" value={status} onChange={this.handleChange} type="text" className="form-control" />
                        </div>
                        <label className="col-sm-3 form-control-label">Status String</label>
                        <div className="col-sm-3">
                          <input disabled name="status" value={statusString} onChange={this.handleChange} type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <div className="col-sm-4 offset-sm-3">
                          <button type="submit" className="btn btn-secondary" style={{ marginRight: 2 }}>Cancel</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Page Footer*/}
        <MyFooter></MyFooter>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_order: (token, newOrder) => {
      dispatch(actAddOrderRequest(token, newOrder))
    },
    get_order: (token, id) => {
      dispatch(actGetOrderRequest(token, id))
    },
    edit_order: (token, id, data) => {
      dispatch(actEditOrderRequest(token, id, data))
    }
  }
}
export default connect(null, mapDispatchToProps)(ActionOrder)
