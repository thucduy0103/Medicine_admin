import React, { Component } from 'react'
import { actFetchContactsRequest, actDeleteContactRequest, actFindContactsRequest } from '../../../redux/actions/contact'
import { Link } from "react-router-dom"
import callApi from '../../../utils/apiCaller'
import MyFooter from "../../MyFooter/MyFooter"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import Paginator from "react-js-paginator"
import { connect } from "react-redux"
import './style.css'
import { io } from 'socket.io-client'
const MySwal = withReactContent(Swal)

const socket = io("http://localhost:3000")
let token
const limit = 20
const page = 1

class Chat extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchText: "",
            total: 0,
            currentPage: 1,
            listUsers: [],
            currentUser : null,
            currentConversation: [],
            message: "",
            unReadUser : '',
            showNew : false
        }
    }

    componentDidMount() {
        socket.on("connect", () => {
            console.log(socket.id) // x8WIv7-mJelg7on_ALbx
            socket.emit('join_room', {
                room: 'admin'
            })
        })
    }

    fetch_reload_data() {
        token = localStorage.getItem('_auth')
        this.props.fetch_contact(token, null).then(res => {
            this.setState({
                total: res.total,
                listUsers: res.results
            })
            if (this.state.currentUser === null) {
              let user = res.results[0]
              callApi(`chat/${this.props.contacts[0].roomId}?limit=${limit}&page=${page}&sortBy=-createdAt`, 'GET', null, token).then(res =>{
                this.setState({
                    currentUser: user,
                    currentConversation: res.data.results
                }, () => {
                    this.onScrollToEnd()
                })
              }).catch(err => {
                  console.log(err)
              })
            }
        }).catch(err => {
            console.log(err)
        })

    }

    componentWillMount() {
        this.fetch_reload_data()
        // ON RECEIVE MESSAGE - push message vao currentConversation
        socket.on('res_chat_text', (data) => {
          if(data.roomId === this.state.currentUser.roomId){
            this.setState({
                currentConversation: [...this.state.currentConversation, {
                    id: 69,
                    avatar: "https://i.imgur.com/53l2KD5.jpg",
                    message: data.message,
                    time: "12:00",
                    senderId: data.senderId === 'admin' ? "me" : "other"
                }]
            }, () => {
                this.onScrollToEnd()
            })
          }else {
            // console.log("false");
            // console.log(data);
            this.fetch_reload_data()
            this.setState({
              showNew: true
            })
          }
        })
    }

    //FETCH
    onFetchContacts() {

    }

    onClickUserMenu = async (e, user) => {
        e.preventDefault()
        const res = await callApi(`chat/${user.roomId}?limit=${limit}&page=${page}&sortBy=-createdAt`, 'GET', null, token)
        this.setState({
            currentUser: user,
            currentConversation: res.data.results
        })
        this.fetch_reload_data()
        // console.log("data: ", res.data.results)
        // CHANGE CURRENT USER & fetch conversations
        // this.setState({
        //     currentUser: user,
        //
        // }, () => {
        //     socket.emit('join_room', {
        //         room: 'admin',
        //     })
        // })
    }

    onClickSendMessage(e) {
        e.preventDefault()

        if (this.state.message === "") {
            return
        }

        this.setState({
            currentConversation: [...this.state.currentConversation, {
                avatar: "https://i.imgur.com/53l2KD5.jpg",
                message: this.state.message,
                senderId: "admin"
            }]
        }, () => {
            // Emit message to server socket
            socket.emit('chat_text', {
                roomId: this.state.currentUser.roomId,
                senderId: 'admin',
                message: this.state.message
            })

            // Reset input message
            this.setState({
                message: ""
            })
            this.onScrollToEnd()
        })
    }

    onScrollToEnd() {
        var objDiv = document.getElementById('main-chat-logs')
        objDiv.scrollTop = objDiv.scrollHeight
    }

    onChangeText(e) {
        e.preventDefault()
        this.setState({
            message: e.target.value
        })
    }

    onKeyDownMessage(e) {
        if (e.key === 'Enter') {
            this.onClickSendMessage(e)
        }
    }

    // RENDER
    render() {
        // let { contacts } = this.props
        // console.log("contacts: ", contacts)
        // console.log(this.props);
        const { listUsers, searchText, total } = this.state
        return (
            <div className="content-inner">
                {/* Page Header*/}
                <header className="page-header">
                    <div className="container-fluid">
                        <h2 className="no-margin-bottom">Chat</h2>
                    </div>
                </header>
                {/* Breadcrumb*/}
                <div className="breadcrumb-holder container-fluid">
                    <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="breadcrumb-item active">chat</li>
                    </ul>
                </div>

                {/* Chat*/}
                <section className="container-chat">
                    <div className="chat-admin__container">
                        <div className="chat-admin__container">
                            <div className="chat-admin__menu">
                                <div className="chat-admin__menu-header">
                                    <input type="text" placeholder="Search" className="chat-admin__menu-search" value={searchText} onChange={(e) => this.setState({ searchText: e.target.value })} />
                                </div>
                                {listUsers && listUsers.length ? listUsers.map((user, index) => {
                                    return (
                                        <div className="chat-admin__menu-item" key={index} onClick={(e) => this.onClickUserMenu(e, user)}>
                                            <div className="chat-admin__menu-item-avatar">
                                                <img src={user.roomAvatar} alt="" />
                                            </div>
                                            <div className="chat-admin__menu-item-name">
                                                {user.roomName}
                                            </div>
                                            <div className="breadcrumb-item active" style={{display: this.state.showNew? 'block' : 'none' }}>
                                                {user.adminRead === false ? '(new message)' : null}
                                            </div>
                                        </div>
                                    )
                                }) : null}
                            </div>
                            {this.state.currentUser ?
                                <div className="chat-admin__main">
                                    <div className="chat-admin__main-header">
                                        <img className='current-user__avatar' src={this.state.currentUser.roomAvatar} alt="" />
                                        <div className="current-user__name">
                                            {this.state.currentUser.roomName}
                                        </div>
                                    </div>
                                    <div className="chat-admin__main-content" id='main-chat-logs'>
                                        {this.state.currentConversation.map((conversation, index) => {
                                            return (
                                                <div className={`chat-admin__main-content-item ${conversation.senderId}`} key={index}>
                                                    <div className="chat-admin__main-content-item-text">{conversation.message}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="chat-admin__main-footer">
                                        <input type="text" placeholder="Type your message"
                                            value={this.state.message} onChange={(e) => this.onChangeText(e)}
                                            onKeyDown={(e) => this.onKeyDownMessage(e)}
                                            className="chat-admin__main-footer-input" />
                                        <button className="chat-admin__main-footer-send" onClick={(e) => this.onClickSendMessage(e)}><i className="icon-paper-airplane" /></button>
                                    </div>
                                </div> : <div className="chat-admin__main-empty">
                                    <h1>Chat with users</h1></div>}

                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        contacts: state.contacts
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetch_contact: (token, offset) => {
            return dispatch(actFetchContactsRequest(token, offset))
        },
        delete_contact: (id, token) => {
            dispatch(actDeleteContactRequest(id, token))
        },
        find_contacts: (token, searchText) => {
            return dispatch(actFindContactsRequest(token, searchText))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
