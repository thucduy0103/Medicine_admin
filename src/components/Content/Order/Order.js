import React, { Component } from 'react'
import './style.css'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { actFetchOrdersRequest, actDeleteOrderRequest, actFindOrdersRequest, actConfirmOrderRequest, actSuccessOrderRequest } from '../../../redux/actions/order';
import Swal from 'sweetalert2'
import Moment from 'react-moment';
import withReactContent from 'sweetalert2-react-content'
import MyFooter from '../../MyFooter/MyFooter'
import Paginator from 'react-js-paginator';
import {exportExcel} from '../../../utils/exportExcel'
const MySwal = withReactContent(Swal)

let token;

class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      total: 0,
      currentPage: 1,
    }
  }


  componentDidMount() {
    this.fetch_reload_data(); //recive data from return promise dispatch
  }

  fetch_reload_data(){
    token = localStorage.getItem('_auth');
    this.props.fetch_orders(token).then(res => {
      this.setState({
        total: res.totalResults
      });
    }).catch(err => {
      console.log(err);
    })
  }

  pageChange(content){
    const limit = 10;
    const nextPage = content
    this.props.fetch_orders(token, nextPage);
    this.setState({
      currentPage: content
    })
    window.scrollTo(0, 0);
  }

  handleSend = (id) => {
    MySwal.fire({
      title: 'Confirm',
        html:
        '<label className="col-sm-3 form-control-label">Shipping Code</label> <input id="swal-input1" className="form-control">' +
        '<label className="col-sm-3 form-control-label">Shipping Total</label> <input id="swal-input2" className="form-control">',
        focusConfirm: false,
        preConfirm: () => {
          const shippingCode = document.getElementById('swal-input1').value
          const shippingTotal = document.getElementById('swal-input2').value
          if (shippingCode == '' || shippingTotal == '') {
            Swal.fire(
              'Confirm!',
              'Your order has not been confirmed.',
              'error'
            )
            return {
              shippingCode,
              shippingTotal
            }
          }else {
            return {
              shippingCode,
              shippingTotal
            }
          }
      }
    }).then(async (result) => {
      if (result.value != null) {
        await this.props.confirm_order(id, result.value, token)
      }
    })
  }

  handleSuccess = (id) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You want to complete the order",
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(async (result) => {
      if (result.value) {
        await this.props.success_order(id, token);
      }
    })
  }

  handleRemove = (id) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
      if (result.value) {
        await this.props.delete_order(id, token);
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      }
    })
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { searchText } = this.state;
    this.props.find_order(token, searchText).then(res => {
      this.setState({
        total: res.total
      })
    })
  }

  downloadExcel = () => {
    const key = 'orders'
    exportExcel(key)
  }

  showOrder(status){
    if (status === 'Unconfirm') {
      return (<div className="col-md-3"><label className="fix-status" style={{background: '#ff9800'}} >{status}</label></div>)
    }
    if (status === 'Confirm') {
      return (
        <div className="col-md-3"><label className="fix-status" style={{background: '#337ab7'}} >{status}</label></div>
      )
    }
    if (status === 'Shipping') {
      return (
        <div className="col-md-3"><label className="fix-status" style={{background: '#634a41'}} >{status}</label></div>
      )
    }
    if (status === 'Complete') {
      return (
        <div className="col-md-3"><label className="fix-status" style={{background: '#5cb85c'}} >{status}</label></div>
      )
    }
    if (status === 'Canceled') {
      return (
        <div className="col-md-3"><label className="fix-status" style={{background: '#d9534f'}} >{status}</label></div>
      )
    }
  }

  showButton(item){
    let buttonConfirm;
    let buttonSuccess;
    if (item.orderStatus == "Unconfirm") {
      buttonConfirm = <span title='Confirm' onClick={() => this.handleSend(item.id)} className="fix-action"><Link to="#"> <i className="fa fa-paper-plane"></i></Link></span>
    }
    if (item.orderStatus == "Confirm") {
      buttonSuccess = <span title='Success' onClick={() => this.handleSuccess(item.id)} className="fix-action"><Link to="#"> <i className="fa fa-check" style={{ color: '#33FF66	' }}></i></Link></span>
    }
    return (
      <div>
        {buttonConfirm}
        {buttonSuccess}
        <span title='View' className="fix-action"><Link to={`/orders/view/${item.id}`}> <i className="fa fa-eye"></i></Link></span>
        <span title='Delete' onClick={() => this.handleRemove(item.id)} className="fix-action"><Link to="#"> <i className="fa fa-trash" style={{ color: '#ff00008f' }}></i></Link></span>
      </div>
    )
  }

  render() {
    const { orders } = this.props;
    const { searchText, total } = this.state;
    return (
      <div className="content-inner">
        {/* Page Header*/}
        <header className="page-header">
          <div className="container-fluid">
            <h2 className="no-margin-bottom">Orders</h2>
          </div>
        </header>
        {/* Breadcrumb*/}
        <div className="breadcrumb-holder container-fluid">
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active">Orders</li>
          </ul>
        </div>
        <section className="tables pt-3">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header d-flex align-items-center">
                    <h3 className="h4">Data Table Orders</h3>
                    <button onClick={()=>this.downloadExcel()} style={{ border: 0, background: "white" }}> <i className="fa fa-file-excel-o"
                        style={{fontSize: 18, color: '#1d7044'}}> Excel</i></button>
                  </div>
                  <form
                    onSubmit={(event) => this.handleSubmit(event)}
                    className="form-inline md-form form-sm mt-0" style={{ justifyContent: 'flex-end', paddingTop: 5, paddingRight: 20 }}>
                    <div>
                      <button style={{ border: 0, background: 'white' }}><i className="fa fa-search" aria-hidden="true"></i></button>
                      <input
                        name="searchText"
                        onChange={this.handleChange}
                        value={searchText}
                        className="form-control form-control-sm ml-3 w-75" type="text" placeholder="Search"
                        aria-label="Search" />
                    </div>
                    <Link to="/orders/add" className="btn btn-primary" > Create</Link>
                  </form>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Number</th>
                            <th>Name</th>
                            {/* <th>Address</th> */}
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Item Amount</th>
                            <th>Shipping Total</th>
                            <th>Total Amount</th>
                            {/* <th>Code</th> */}
                            <th>Created At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders && orders.length ? orders.map((item, index) => {
                            return (
                              <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{item.receiverName}</td>
                                {/* <td>{item.address}</td> */}
                                <td>{item.phoneNumber}</td>
                                <td>{this.showOrder(item.orderStatus)}</td>
                                <td>{item.listCart.length}</td>
                                <td>{item.shippingTotal}</td>
                                <td>{item.totalAmount}</td>
                                {/*<td>{item.id}</td> */}
                                <td>
                                  <Moment format="DD/MM/YYYY">
                                    {item.createdAt}
                                  </Moment>
                                </td>
                                <td>
                                  {this.showButton(item)}
                                </td>
                              </tr>
                            )
                          }) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <nav aria-label="Page navigation example" style={{ float: "right" }}>
                  <ul className="pagination">
                  <Paginator
                        pageSize={10}
                        totalElements={total}
                        onPageChangeCallback={(e) => {this.pageChange(e)}}
                      />
                  </ul>
                </nav>
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

const mapStateToProps = (state) => {
  return {
    orders: state.orders
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_orders: (token, offset) => {
      return dispatch(actFetchOrdersRequest(token, offset))
    },
    delete_order: (id, token) => {
      dispatch(actDeleteOrderRequest(id, token))
    },
    confirm_order: (id, data, token) => {
      dispatch(actConfirmOrderRequest(id, data, token))
    },
    success_order: (id, token) => {
      dispatch(actSuccessOrderRequest(id, token))
    },
    find_order: (token, searchText) => {
      return dispatch(actFindOrdersRequest(token, searchText))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Order)
