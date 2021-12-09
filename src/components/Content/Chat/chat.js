import React, { Component } from 'react'
import { actFetchContactsRequest, actDeleteContactRequest, actFindContactsRequest } from '../../../redux/actions/contact'
import { exportExcel } from '../../../utils/exportExcel'
import { Link } from "react-router-dom"
import MyFooter from "../../MyFooter/MyFooter"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import Paginator from "react-js-paginator"
import { connect } from "react-redux"
import './style.css'
const MySwal = withReactContent(Swal)


class Chat extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchText: "",
            total: 0,
            currentPage: 1,
            users: [
                {
                    id: 1,
                    name: "Nguyễn Văn A",
                    avatar: "https://i.imgur.com/53l2KD5.jpg"
                },
                {
                    id: 2,
                    name: "Nguyễn Văn B",
                    avatar: "https://i.imgur.com/53l2KD5.jpg"
                },
                {
                    id: 3,
                    name: "Nguyễn Văn C",
                    avatar: "https://i.imgur.com/53l2KD5.jpg"
                },
                {
                    id: 4,
                    name: "Nguyễn Văn D",
                    avatar: "https://i.imgur.com/53l2KD5.jpg"
                },
                {
                    id: 5,
                    name: "Nguyễn Văn E",
                    avatar: "https://i.imgur.com/53l2KD5.jpg"
                }
            ],
            currentUser: {
                id: 1,
                name: "Nguyễn Văn A",
                avatar: "https://i.imgur.com/53l2KD5.jpg"
            },
            currentConversation: [
                {
                    id: 1,
                    avatar: "https://i.imgur.com/53l2KD5.jpg",
                    text: "Hello",
                    time: "12:00",
                    sender: "me"
                },
                {
                    id: 2,
                    avatar: "https://i.imgur.com/53l2KD5.jpg",
                    text: "Hello",
                    time: "12:00",
                    sender: "other"
                },
                {
                    id: 3,
                    avatar: "https://i.imgur.com/53l2KD5.jpg",
                    text: "DCM",
                    time: "12:00",
                    sender: "me"
                }
            ],
            message: ""

        }
    }

    componentDidMount() {
    }

    onClickUserMenu(e, user) {
        e.preventDefault()
        this.setState({
            currentUser: user
        })
    }

    onClickSendMessage(e) {
        e.preventDefault()
        let newMessage = {
            id: 69,
            avatar: "https://i.imgur.com/53l2KD5.jpg",
            text: this.state.message,
            time: "12:00",
            sender: "me"
        }
        this.setState({
            currentConversation: [...this.state.currentConversation, newMessage]
        }, () => {
            this.setState({
                message: ""
            })
        })
    }

    onChangeText(e) {
        e.preventDefault()
        this.setState({ message: e.target.value })
    }

    onKeyDownMessage(e) {
        if (e.key === 'Enter') {
            this.onClickSendMessage(e)
        }
    }

    render() {
        let { contacts } = this.props
        const { searchText, total } = this.state
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

                                {this.state.users.map((user, index) => {
                                    return (
                                        <div className="chat-admin__menu-item" key={index} onClick={(e) => this.onClickUserMenu(e, user)}>
                                            <div className="chat-admin__menu-item-avatar">
                                                <img src={user.avatar} alt="" />
                                            </div>
                                            <div className="chat-admin__menu-item-name">
                                                {user.name}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="chat-admin__main">
                                <div className="chat-admin__main-header">
                                    <img className='current-user__avatar' src={this.state.currentUser.avatar} alt="" />
                                    <div className="current-user__name">
                                        {this.state.currentUser.name}
                                    </div>
                                </div>
                                <div className="chat-admin__main-content">
                                    {this.state.currentConversation.map((conversation, index) => {
                                        return (
                                            <div className={`chat-admin__main-content-item ${conversation.sender}`} key={index}>
                                                <div className="chat-admin__main-content-item-avatar"></div>
                                                <div className="chat-admin__main-content-item-text">{conversation.text}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="chat-admin__main-footer">
                                    <input type="text" placeholder="Type your message"
                                        value={this.state.message} onChange={(e) => this.onChangeText(e)}
                                        onKeyDown={(e) => this.onKeyDownMessage(e)}
                                        className="chat-admin__main-footer-input" />
                                    <button className="chat-admin__main-footer-send" onClick={(e) => this.onClickSendMessage(e)}>Send</button>
                                </div>
                            </div>
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