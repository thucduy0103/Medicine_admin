import React, { Component } from 'react'
import MyFooter from '../../MyFooter/MyFooter'
import { actAddHomepageRequest, actGetHomepageRequest, actEditHomepageRequest } from '../../../redux/actions/homepage';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import callApi from '../../../utils/apiCaller';
import { uploadImage } from '../../../utils/upload'
import { css } from '@emotion/core';
import ClipLoader from 'react-spinners/ClipLoader';

let token;
let id;

const override = css`
    display: block;
    margin: 0 auto;
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
`;
class ActionProducer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      desc: '',
      address: '',
      image: '',
      categoryId: 0,
      dataCategories: [],
      redirectToProducer: false,
      img: null,
      loading: false
    };
    id = this.props.id
  }

  async componentDidMount() {
    token = localStorage.getItem('_auth');
    const resCategories = await callApi('products/categories', 'GET', null, token);
    this.setState({
      dataCategories: resCategories.data.results,
    })
    if (id) {
      const res = await callApi(`producers/${id}`, 'GET', null, token);
      this.setState({
        name: res.data.name,
        desc: res.data.description,
        address: res.data.address,
        image: res.data.image,
        categoryId: res.data.categoryId
      })
    }
  }

  handleImport = () => {
    console.log("abcd");
  }

  handleChangeImage = (event) => {
    if (event.target.files[0]) {
      const img = event.target.files[0];
      this.setState(() => ({ img }));
    }
    const output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log("handleSubmit");
    const { name, desc, address, categoryId } = this.state;
    let { img, image } = this.state;
    this.setState({
      loading: true
    })
     //upload image to firebase
     if (img !== null && img !== image) {
      image = await uploadImage(img);
    }
    const newDesc = desc === '' ? null : desc;
    const newName = name === '' ? null : name;
    const newAddress = address === '' ? null : address;
    const newImage= (image === '') ? null : image
    if (!id) {
      const newProducer = {
        name: newName,
        description: newDesc,
        address: newAddress,
        categoryId,
        image: newImage
      }
      this.props.add_Producer(token, newProducer);
      this.setState({
        name: '',
        desc: '',
        address: ''
      })
    } else {
      const editProducer = {
        name: newName,
        description: newDesc,
        address: newAddress,
        categoryId,
        image: newImage
      }
      await this.props.edit_Producer(token, id, editProducer);
      this.setState({
        redirectToProducer: true
      })
    }
  }


  render() {
    const { name, desc, address, redirectToProducer, categoryId, loading, image } = this.state;
    if (redirectToProducer) {
      return <Redirect to='/producers'></Redirect>
    }
    return (
      <div className="content-inner">
        {/* Page Header*/}
        <div className='sweet-loading'>
          <ClipLoader
            css={override}
            sizeUnit={"px"}
            size={30}
            color={'#796aeebd'}
            loading={loading}
          />
        </div>
        <header className="page-header">
          <div className="container-fluid">
            <h2 className="no-margin-bottom">Forms Producer</h2>
          </div>
        </header>
        {/* Breadcrumb*/}
        <div className="breadcrumb-holder container-fluid">
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="index.html">Home</a></li>
            <li className="breadcrumb-item active">Producer</li>
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
                    <h3 className="h4">Description</h3>
                  </div>
                  <div className="card-body">
                    <form className="form-horizontal" onSubmit={(event) => this.handleSubmit(event)} >
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Title</label>
                        <div className="col-sm-9">
                          <input name="title" onChange={this.handleChange} value={name} type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">List ids</label>
                        <div className="col-sm-9">
                          {/* <input name="list" onChange={this.handleChange} value={desc} type="text" placeholder="id_1, id_2,..." className="form-control" /> */} 
                          <button type="reset" onClick={() => this.handleImport()} className="btn btn-primary">Import list product</button>
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label htmlFor="fileInput" className="col-sm-3 form-control-label">Image</label>
                        <div className="col-sm-9">
                        <input type="file" onChange={this.handleChangeImage} className="form-control-file" />
                        <div className="fix-cart">
                          <img src={image || 'http://via.placeholder.com/400x300'} id="output" className="fix-img" alt="avatar" />
                          </div>
                       </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <div className="col-sm-4 offset-sm-3">
                          <button type="reset" className="btn btn-secondary" style={{ marginRight: 2 }}>Cancel</button>
                          <button type="submit" className="btn btn-primary">Save changes</button>
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
    add_Producer: (token, newProducer) => {
      dispatch(actAddHomepageRequest(token, newProducer))
    },
    get_Producer: (token, id) => {
      dispatch(actGetHomepageRequest(token, id))
    },
    edit_Producer: (token, id, data) => {
      dispatch(actEditHomepageRequest(token, id, data))
    }
  }
}
export default connect(null, mapDispatchToProps)(ActionProducer)
