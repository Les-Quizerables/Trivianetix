import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'

function MessageBoard(props) {

    const [currentMessage, setMessage] = useState('');
    const [messageList, addMessage] = useState([]);

    function updateMessage(e) {
        setMessage(e.target.value);
    }

    function submitMessage(e) {
        e.preventDefault();
        socket.emit('find room', props.venue)
        socket.emit('chat message', currentMessage)
    }

    socket.on('chat message', function (msg) {
        const message = (<div key={messageList.length} className='message'>{msg}</div>)
        const updatedMessageList = [...messageList, message]
        addMessage(updatedMessageList);
    })


    return (
        <div className='message-board flex j-center fd-col'>
            <ul id="messages" className="fs-14">
                {messageList}
            </ul>

            {/* <form action="">
                <input id="message-input" onChange={updateMessage} value={currentMessage} /><button onClick={submitMessage}>Send</button>
            </form> */}
            <Form className="chat-form flex fd-row fs-14">
                <Form.Control id="message-input" onChange={updateMessage} value={currentMessage} className="chat-input" />
                <Button variant="primary" type="submit" onClick={submitMessage}>
                    Send
                </Button>
            </Form>

        </div>
    )
}

export default MessageBoard;