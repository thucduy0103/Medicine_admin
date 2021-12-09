import React, { Component } from 'react'
import MyFooter from '../../MyFooter/MyFooter'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { actAddProductRequest, actGetProductRequest, actEditProductRequest } from '../../../redux/actions/product';
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom';
import callApi from '../../../utils/apiCaller';
import { uploadImage } from '../../../utils/upload'
import Dropzone from 'react-dropzone';
import { css } from '@emotion/core';
import ClipLoader from 'react-spinners/ClipLoader';
import moment from 'moment'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
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
class ActionProduct extends Component {
  constructor(props) {
    super(props);
    this.onDrop = (files) => {
      let data = [];
      if(this.state.dataGallery !== null) {
        data = this.state.dataGallery
        if(files && files.length !== 0) {
         files.forEach(item => data.push(item))
        }
      }
      if(!id){
        this.setState({
          files
        })
      } else {
        this.setState({
          files,
          dataGallery: data
        })
      }
    };
    this.state = {
      nameProduct: '',
      price: 0,
      discountPrice: 0,
      numberAvailable: 0,
      unit: '',
      category: [],
      desc: '',
      image: '',
      properties: {},
      productionDate: moment().format("DD/MM/YYYY"),
      expiryDate: moment().add(1, 'Y').format("DD/MM/YYYY"),
      redirectToProduct: false,
      dataCategories: [],
      dataProducer: [],
      img: null,
      loading: false,
      files: [],
      dataGallery: [],
      selectCategories: []
    };
    id = this.props.id
  }

  async componentDidMount() {
    token = localStorage.getItem('_auth');
    const resCategories = await callApi('categories?limit=100', 'GET', null, token);
    this.setState({
      dataCategories: resCategories.data.results
    })
    if (id) {
      const res = await callApi(`products/get-product-by-id?ProductId=${id}`, 'GET', null, token);
      if (res && res.status === 200){
        // const resProducer =  await callApi(`category/${res.data.chooseCategories}/producers`, 'GET', null);
        const convertProperties = JSON.stringify(res.data.properties)
        this.setState({
          // dataProducer: resProducer,
          nameProduct: res.data.name,
          price: res.data.price,
          discountPrice: res.data.discountPrice,
          unit: res.data.unit,
          numberAvailable: res.data.inventoryQty,
          category: res.data.category,
          desc: res.data.description,
          image: res.data.image,
          properties: convertProperties,
          productionDate: res.data.productionDate,
          expiryDate: res.data.expiryDate,
          dataGallery: res.data.imageDetail
        })
      }
      }

  }
  handleChangeEditor = (value) => {
    this.setState({ desc: value })
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
  handleChangeProductionDate = (event) => {
    const value = moment(event).format("DD/MM/YYYY");
    this.setState({
      productionDate: value
    });
  }
  handleChangeExpiryDate = (event) => {
    const value = moment(event).format("DD/MM/YYYY");
    this.setState({
      expiryDate: value
    });
  }

  handleChangeCategory = async (event) => {
    const target = event.target;
    // const value = target.type === 'checkbox' ? target.checked : target.value;
    var newStateArray = this.state.category.slice();
    if (target.checked) {
      newStateArray.push(target.value);
    }else {
      newStateArray = newStateArray.filter(function(ele){
          return ele != target.value;
      });
    }
    this.setState({
      category: newStateArray
    })
  }

  handleChangeRemoveGallery = (index) => {
    const data = [...this.state.dataGallery];
    this.setState({
      dataGallery: data.splice(index, 1)
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const {files, dataGallery, nameProduct, price, discountPrice, numberAvailable, unit, category, desc, properties, productionDate, expiryDate } = this.state;
    let { image, img } = this.state;
    let newFiles = dataGallery;
    this.setState({
      loading: true
    })
    if (img !== null && img !== image) {
      image = await uploadImage(img);
    }
    if (files.length > 0){
      for( const file of files){
        const builder = await uploadImage(file);
        newFiles.push(builder);
      }
    }
    const newDesc = desc === '' ? null : desc;
    const newName = nameProduct === '' ? null : nameProduct;
    const newImage = image === '' ? null : image;
    const newGallery = newFiles && newFiles.length === 0 ? null : newFiles;
    const newProperties = properties === {} ? null : properties;
    const newNumberAvailable = parseInt(numberAvailable);
    const newProductionDate = productionDate
    const newExpiryDate =  expiryDate
    const newCategory = category;
    let newGalleryFinal = [];
    if(newGallery && newGallery.length) {
      newGallery.forEach((item) => {
        if(typeof(item) === 'string'){
          newGalleryFinal.push(item)
        }
      })
    }
    if (!id) {
      const newProduct = {
        name: newName,
        slug : "slug",
        content: newName,
        price :price,
        discountPrice : discountPrice,
        inventoryQty: newNumberAvailable,
        unit : unit,
        category: newCategory,
        image: newImage,
        imageDetail: newGalleryFinal,
        description: newDesc,
        productionDate: newProductionDate,
        expiryDate : newExpiryDate
      }
      this.props.add_Product(token, newProduct);
      this.setState({
        nameProduct: '',
        image: '',
        desc: '',
        properties: {},
        dataGallery: newGalleryFinal,
        loading: false,
        redirectToProduct: true,
      })
    } else {
      const editProduct = {
        name: newName,
        slug:"slug",
        content: newName,
        price :price,
        discountPrice : discountPrice,
        unit :"Hộp",
        inventoryQty :numberAvailable,
        category : category,
        image: newImage,
        imageDetail: newGalleryFinal,
        description: newDesc,
        productionDate: newProductionDate,
        expiryDate : newExpiryDate
      }
      await this.props.edit_Product(token, id, editProduct);
      this.setState({
        loading: false,
        redirectToProduct: true,
        dataGallery: newGalleryFinal
      })
    }
  }
  modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  render() {
    const { dataGallery, nameProduct, loading, price, discountPrice, numberAvailable, unit, category, image, desc, producerId, redirectToProduct, dataCategories, productionDate, expiryDate } = this.state;
    let files;
    if(dataGallery && dataGallery.length !== 0) {
      files = dataGallery.map((file, index) => {
        return(
        <span key={index}>
          {
            typeof(file) !== 'object' ?
            <img src={file} style={{height: 100, width: 100}} alt="notfound" />
            :
            <img src={URL.createObjectURL(file)} style={{height: 100, width: 100}} alt="notfound"/>
          }
        </span>
        )
      })
    } else {
      files = this.state.files.map(file => (
        <img src={URL.createObjectURL(file)} style={{height: 100, width: 100}} alt="notfound" />
      ));
    }
    if (redirectToProduct) {
      return <Redirect to='/products'></Redirect>
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
            <h2 className="no-margin-bottom">Form Product</h2>
          </div>
        </header>
        {/* Breadcrumb*/}
        <div className="breadcrumb-holder container-fluid">
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="index.html">Home</a></li>
            <li className="breadcrumb-item active">Product</li>
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
                        <label className="col-sm-3 form-control-label">Name Product</label>
                        <div className="col-sm-9">
                          <input name="nameProduct" onChange={this.handleChange} value={nameProduct} type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Price</label>
                        <div className="col-sm-3">
                          <input name="price" onChange={this.handleChange} value={price} type="number" className="form-control" />
                        </div>
                        <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Discount Price</label>
                        <div className="col-sm-3">
                          <input name="discountPrice" onChange={this.handleChange} value={discountPrice} type="number" className="form-control" />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Unit</label>
                        <div className="col-sm-3">
                          <input name="unit" onChange={this.handleChange} value={unit} type="text" className="form-control" />
                        </div>
                        <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Available</label>
                        <div className="col-sm-3">
                          <input name="numberAvailable" onChange={this.handleChange} value={numberAvailable} type="number" className="form-control" />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label htmlFor="fileInput" className="col-sm-3 form-control-label">image</label>
                        <div className="col-sm-9">
                          <input type="file" onChange={this.handleChangeImage} className="form-control-file" />
                          <div className="fix-cart-product">
                            <img src={image || 'http://via.placeholder.com/300x200'} id="output" className="fix-img-product" alt="avatar" />
                          </div>
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Descriptons</label>
                        <div className="col-sm-9">
                          <ReactQuill
                            modules={this.modules}
                            formats={this.formats}
                            value={desc}
                            onChange={this.handleChangeEditor} />
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Production Date</label>
                        <div className="col-sm-3">
                          <DatePicker name="productionDate" value={productionDate} onChange={this.handleChangeProductionDate}/>
                          {/* <input name="productionDate" onChange={this.handleChange} value={productionDate} type="date" className="form-control"/>*/}
                        </div>
                        <label className="col-sm-3 form-control-label" style={{textAlign: 'center'}}>Expiry Date</label>
                        <div className="col-sm-3">
                          <DatePicker name="expiryDate" value={expiryDate} onChange={this.handleChangeExpiryDate}/>
                          {/* <input name="expiryDate" onChange={this.handleChange} value={expiryDate} type="date" className="form-control" />*/}
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label">Categories</label>
                        <div className="col-sm-9">
                          {/* <textarea name="properties" onChange={this.handleChange} value={properties} rows="5" className="form-control" /> */}
                          {dataCategories && dataCategories.length ?
                            dataCategories.map((item, index) => {
                              return (
                                <div key={index} className="i-checks" style={{ display: 'inline-block', paddingRight: 35 }} >
                                  {
                                     category.includes(item.slug) ?
                                      <input id={index} name="category" checked onChange={this.handleChangeCategory} type="checkbox" value={item.slug} className="checkbox-template" />
                                      :
                                      <input id={index} name="category" onChange={this.handleChangeCategory} type="checkbox" value={item.slug} className="checkbox-template" />
                                  }
                                  <label>{item.name}</label>
                                </div>
                              )
                            })
                            : null
                          }
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <label className="col-sm-3 form-control-label pt-50">Gallery</label>
                        <div className="col-sm-9">
                            <Dropzone onDrop={this.onDrop}>
                            {({getRootProps, getInputProps}) => (
                              <section className="container" style={{border: '1px dotted'}}>
                                <div {...getRootProps({className: 'dropzone'})}>
                                  <input {...getInputProps()} />
                                  <h2>Upload gallery images here !!!</h2>
                                </div>
                                <aside>
                                  <div>{files}</div>
                                </aside>
                              </section>
                          )}
                        </Dropzone>
                        </div>
                      </div>
                      <div className="line" />
                      <div className="form-group row">
                        <div className="col-sm-4 offset-sm-3">
                          <Link to="/products" className="btn btn-secondary" style={{ marginRight: 2 }}>Cancel</Link>
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
    add_Product: (token, newProduct) => {
      dispatch(actAddProductRequest(token, newProduct))
    },
    get_Product: (token, id) => {
      dispatch(actGetProductRequest(token, id))
    },
    edit_Product: (token, id, data) => {
      dispatch(actEditProductRequest(token, id, data))
    }
  }
}
export default connect(null, mapDispatchToProps)(ActionProduct)
