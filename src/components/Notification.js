import React, { Component } from 'react';
import './Notification.css';  // Import your notification styles

class NotificationSystem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dangerousArea: true,
    };
  }

  // Function to show the notification
  showNotification = () => {
    this.setState({ dangerousArea: true });

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  };

  // Function to hide the notification
  hideNotification = () => {
    this.setState({ dangerousArea: false });
  };

  render() {
    const { dangerousArea } = this.state;

    return (
      <div className={`notification ${dangerousArea ? 'show' : 'hide'}`}>
        <p>Dangerous Area Detected!</p>
        <button onClick={this.hideNotification}>Dismiss</button>
      </div>
    );
  }
}

export default NotificationSystem;
