import React, { Component } from 'react';

class UserInfo extends Component {
  render() {
    const username = this.props.username;
    return (
      <div>
        <h1 className="header-tag">Welcome back {username}!</h1>
      </div>
    );
  }
}

export default UserInfo;
