import React, {Component} from "react";


class VideoChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            localVideo: null,
            remoteVideo: [],
            localStream: null,
        };
        this.peerConnection = new RTCPeerConnection();
        this.remotePeerConnection = new RTCPeerConnection();
        this.startLocalVideo = this.startLocalVideo.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);
        this.onClick = this.onClick.bind(this);
        this.props.socket.on("webrtc", (data) => {
            console.log("webrtc", data);
            // eslint-disable-next-line default-case
            switch (data.type) {
                case "candidate":
                    let candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
                    this.peerConnection.addIceCandidate(candidate)
                        .then(() => console.log("add ice candidate succeeded"))
                        .catch(err => console.log(err));
                    break;
                case "offer":
                    // this.remotePeerConnection = new RTCPeerConnection();
                    // this.remotePeerConnection.
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
                    this.createAnswer();
                    // this.setState()
                    break;
                case "answer":
                    // this.remotePeerConnection = new RTCPeerConnection();
                    // this.remotePeerConnection.
                    this.peerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
            }
        })
    }


    componentDidMount() {
        console.log("did mount");
        this.setState({
            localVideo: document.getElementById("localVideo"),
            remoteVideo: document.getElementById("remoteVideo"),
        });
        this.peerConnection.onicecandidate = this.onIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.localStream !== prevState.localStream) {
            this.state.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.state.localStream));
        }
    }

    onClick(e) {
        this.createOffer();
        this.startLocalVideo();
    }

    createOffer() {
        this.peerConnection.createOffer()
            .then((description) => {
                return this.peerConnection.setLocalDescription(description)
            })
            .then(() => {
                this.props.socket.emit("webrtc", this.peerConnection.localDescription);
                console.log("ok!");
            })
            .catch(err => console.log("creating offer failed", err));
    }

    createAnswer() {
        this.peerConnection.createAnswer()
            .then((description) => {
                return this.peerConnection.setLocalDescription(description)
                // .catch(err => console.loog("creating offer failed", err));
            })
            .then(() => {
                this.props.socket.emit("webrtc", this.peerConnection.localDescription);
                console.log("ok!")
            })
            .catch(err => console.log("creating answer failed", err));
    }

    onIceCandidate(e) {
        console.log("ice candidate");
        if (e.candidate) {
            this.props.socket.emit("webrtc", {
                type: 'candidate',
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate
            })
        }
    }

    startLocalVideo() {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then(stream => {
                // this.setState({})
                let {localVideo} = this.state;
                localVideo.srcObject = stream;
                this.setState({
                    localVideo: localVideo,
                    localStream: stream
                });
            })
            .catch(err => console.log(err))
    }

    gotRemoteStream(e) {
        console.log("Remote stream");
        console.log(e.streams);
        if (this.state.remoteVideo.srcObject !== e.streams[0]) {
            let {remoteVideo} = this.state;
            remoteVideo.srcObject = e.streams[0];
            // Object.assign({},)
            this.setState({remoteVideo: remoteVideo});
            // console.log('pc2 received remote stream');
        }
    }

    render() {
        return (<div>
            <div>
                <video id="localVideo" autoPlay={true}/>
                <video id="remoteVideo" autoPlay={true}/>
            </div>
            <div>
                <button onClick={this.onClick}>Start broadcast</button>
            </div>
        </div>)
    }
}

export default VideoChat;
