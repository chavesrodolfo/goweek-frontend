import React, { Component } from 'react'
import api from '../services/api'
import socket from 'socket.io-client'

import twitterLogo from '../twitter.svg';
import './Timeline.css';

import Tweet from '../components/Tweet'

export default class Timeline extends Component {

  state = {
    tweets: [],
    newTweet: ''
  };

  // Método herdado do Component que é executado quando o componente é criado (exibido em tela)
  async componentDidMount() {
    this.subscribeToEvents()

    const response = await api.get('tweets')
    this.setState({
      tweets: response.data
    })
  }

  subscribeToEvents = () => {
    const io = socket('http://localhost:3000')

    io.on('tweet', data => {
      this.setState({
        // coloca o tweet na primeira posicao do array e copia todos os outros da lista para as demais posições
        tweets: [data, ...this.state.tweets]
      });
    });

    io.on('like', data => {
      this.setState({
        //percorre os tweets, procura o que precisa ser atualizado e atualiza
        tweets: this.state.tweets.map(tweet => 
          tweet._id === data._id ? data : tweet)
      });
    });
  }

  handleInputChange = e => {
    this.setState({ newTweet: e.target.value });
  };

  handleNewTweet = async e => {
    if (e.keyCode !== 13) return;

    const content = this.state.newTweet;
    const author = localStorage.getItem('@GoTwitter:username');

    await api.post('tweets', { content, author });

    this.setState({ newTweet: '' });
  };

  render() {
    return (
      <div className="timeline-wrapper">
        <img height={24} src={twitterLogo} alt="GoTwitter" />
        <form onSubmit={this.handleSubmit}>
          <textarea value={this.state.newTweet}
            onChange={this.handleInputChange}
            onKeyDown={this.handleNewTweet}
            placeholder="O que está acontecendo?" />
        </form>

        <ul className="tweet-list">
          {this.state.tweets.map(tweet => (
            <Tweet key={tweet._id} tweet={tweet} />
          ))}
        </ul>

      </div>
    )
  }
}