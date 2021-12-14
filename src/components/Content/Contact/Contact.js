import React, { Component } from 'react'
import { actFetchContactsRequest, actGetContactRequest, actFindContactsRequest } from '../../../redux/actions/contact';
import {exportExcel} from '../../../utils/exportExcel'
import { Link } from "react-router-dom";
import callApi from '../../../utils/apiCaller';
import MyFooter from "../../MyFooter/MyFooter";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Paginator from "react-js-paginator";
import { connect } from "react-redux";
import './style.css'
import { io } from 'socket.io-client'
const MySwal = withReactContent(Swal);

const socket = io("http://localhost:3000")
let token;

class Contact extends Component {

    constructor(props) {
        super(props);
        this.state = {
          searchText: "",
          total: 0,
          currentPage: 1,
          currentUser: {
              id: 1,
              roomName: "Nguyễn Văn A",
              roomAvatar: "https://i.imgur.com/53l2KD5.jpg"
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
        };
      }

      componentDidMount() {
        this.fetch_reload_data()
        socket.on("connect", () => {
            console.log(socket.id); // x8WIv7-mJelg7on_ALbx
          })
      }

      componentWillMount() {
          // id dang de tam la 'anhkhoa'
          socket.emit('join_room', {
              room: 'anhkhoa'
          });

          // ON RECEIVE MESSAGE - push message vao currentConversation
          socket.on('res_chat_text', (data) => {
              console.log(data);
          })
      }

      fetch_reload_data(){
        token = localStorage.getItem('_auth');
        this.props.fetch_contact(token, null).then(res => {
          this.setState({
            total: res.total
          });
        }).catch(err => {
          console.log(err);
        })
      }

      pageChange(content) {
        const limit = 10;
        const offset = limit * (content - 1);
        this.props.fetch_contact(token, offset);
        this.setState({
          currentPage: content
        });
        window.scrollTo(0, 0);
      }

      onClickUserMenu = async (id) => {
        const res = await callApi(`chat/${id}`, 'GET', null, token)
        this.setState({
            currentUser: res.data
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
          socket.emit('chat_text', {roomId: 'anhkhoa', roomName: "sdfdsfsd", message: this.state.message});


          // SET STATE tạm de show message
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
        let { contacts } = this.props;
        const { searchText, total } = this.state;
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
                              {contacts && contacts.length ? contacts.map((item, index) => {
                                  return (
                                      <div className="chat-admin__menu-item" key={index} onClick={() => this.onClickUserMenu(item.id)}>
                                          <div className="chat-admin__menu-item-avatar">
                                              <img src={item.roomAvatar} alt="" />
                                          </div>
                                          <div className="chat-admin__menu-item-name">
                                              {item.roomName}
                                          </div>
                                          <br/>
                                          <div>
                                              {item.roomName}
                                          </div>
                                      </div>
                                  )
                              }) : null}
                          </div>
                          <div className="chat-admin__main">
                              <div className="chat-admin__main-header">
                                  <img className='current-user__avatar' src={this.state.currentUser.roomAvatar} alt="" />
                                  <div className="current-user__name">
                                      {this.state.currentUser.roomName}
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
    };
  };

  const mapDispatchToProps = dispatch => {
    return {
      fetch_contact: (token, offset) => {
        return dispatch(actFetchContactsRequest(token, offset));
      },
      get_contact: (id, token) => {
        return dispatch(actGetContactRequest(id, token));
      },
      find_contacts: (token, searchText) => {
        return dispatch(actFindContactsRequest(token, searchText));
      }
    };
  };

  export default connect(mapStateToProps, mapDispatchToProps)(Contact);
