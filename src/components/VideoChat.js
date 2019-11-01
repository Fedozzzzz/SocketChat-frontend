import React, {Component} from "react";

const options = {
    iceServers: [
        {url: "stun:23.21.150.121"},
        {url: "stun:stun.l.google.com:19302"}],
    optional: [
        {DtlsSrtpKeyAgreement: true},
        {RtpDataChannels: true}
    ]
};

class VideoChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            localVideo: null,
            remoteVideo: new Map(),
            localStream: null,
            socketId: this.props.socket.id,
            peerConnections: new Map(),
            callDisabled: true,
            hangupDisabled: true,
        };
        this.fromId = null;
        this.startLocalVideo = this.startLocalVideo.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);
        this.startBroadcast = this.startBroadcast.bind(this);
        this.call = this.call.bind(this);
        this.join = this.join.bind(this);
        this.hangup = this.hangup.bind(this);
        this.getPeerIdByKey = this.getPeerIdByKey.bind(this);
        //socket actions
        this.props.socket.on("webrtc signal", (fromId, data) => {
            let currentPeerConnections = this.state.peerConnections.get(fromId);
            this.fromId = fromId;
            // eslint-disable-next-line default-case
            switch (data.type) {
                case "candidate":
                    let candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
                    currentPeerConnections.addIceCandidate(candidate)
                        .then(() => console.log("add ice candidate succeeded"))
                        .catch(err => console.log(err));
                    break;
                case "offer":
                    currentPeerConnections.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
                    this.createAnswer(fromId, currentPeerConnections);
                    break;
                case "answer":
                    currentPeerConnections.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
            }
        });
        this.props.socket.on("webrtc make offer", members => {
            // console.log("make offer:", members);
            members.forEach(member => {
                let pc = this.state.peerConnections.get(member);
                this.createOffer(member, pc);
                this.props.socket.emit("webrtc offer")
            });
        })
    }

    componentDidMount() {
        console.log("did mount");
        let remoteVideo = new Map();
        for (let [id, peer] of this.state.peerConnections) {
            remoteVideo.set(id, document.getElementById("remoteVideo" + id));
        }
        this.setState({localVideo: document.getElementById("localVideo"), remoteVideo});
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.members) {
            let {peerConnections} = this.state;
            for (let member in nextProps.members) {
                if (member !== this.state.socketId
                    && !peerConnections.has(member)) {
                    let pc = new RTCPeerConnection(options);
                    pc.ontrack = this.gotRemoteStream;
                    pc.onicecandidate = this.onIceCandidate;
                    peerConnections.set(member, pc);
                }
            }
            this.setState(peerConnections);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("did update");
        if (this.state.localStream !== prevState.localStream) {
            this.state.peerConnections.forEach(pc =>
                this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream)));
        }
        if (this.props.members !== prevProps.members) {
            let {remoteVideo} = this.state;
            for (let [id, peer] of this.state.peerConnections) {
                remoteVideo.set(id, document.getElementById("remoteVideo" + id));
            }
            if (this.state.localStream) {
                navigator.mediaDevices.getUserMedia({audio: true, video: true})
                    .then(stream => this.setState({localStream: stream,}))
                    .catch(err => console.log(err));
            }
            this.setState({remoteVideo});
        }
    }

    startBroadcast(e) {
        this.startLocalVideo();
        this.setState({callDisabled: false});
    }

    createOffer(id, pc) {
        console.log("creating offer");
        pc.createOffer()
            .then((description) => {
                return pc.setLocalDescription(description)
            })
            .then(() => {
                this.props.socket.emit("webrtc signal", id, pc.localDescription);
                console.log("setting local description successful!");
            })
            .catch(err => console.log("creating offer failed", err));
    }

    createAnswer(id, pc) {
        console.log("creating answer");
        pc.createAnswer()
            .then((description) => {
                return pc.setLocalDescription(description)
            })
            .then(() => {
                this.props.socket.emit("webrtc signal", id, pc.localDescription);
                console.log("setting local description successful!")
            })
            .catch(err => console.log("creating answer failed", err));
    }

    onIceCandidate(e) {
        const fromId = this.fromId;
        console.log("ice candidate", e, fromId);
        let identity = this.getPeerIdByKey(e.currentTarget);
        if (e.candidate) {
            this.props.socket.emit("webrtc signal", identity, {
                type: 'candidate',
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate
            })
        }
    }

    call() {
        this.props.socket.emit("webrtc offer");
        this.setState({hangupDisabled: false})
    }

    join() {
        this.props.socket.emit("webrtc join");
    }

    hangup() {
        this.state.peerConnections.forEach(pc => pc.close());
        this.props.socket.emit("webrtc hangup");
    }

    startLocalVideo() {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then(stream => {
                let {localVideo} = this.state;
                localVideo.srcObject = stream;
                this.setState({
                    localVideo: localVideo,
                    localStream: stream,
                });
            })
            .catch(err => console.log(err));
    }

    getPeerIdByKey(value) {
        for (let [id, peer] of this.state.peerConnections) {
            if (value === peer) {
                return id;
            }
        }
    }

    gotRemoteStream(e) {
        console.log("got remote stream");
        let identity = this.getPeerIdByKey(e.currentTarget);
        if (this.state.remoteVideo.srcObject !== e.streams[0]) {
            let {remoteVideo} = this.state;
            remoteVideo.get(identity).srcObject = e.streams[0];
            this.setState({remoteVideo: remoteVideo});
        }
    }

    renderRemoteVideo() {
        let result = [];
        for (let [id, peer] of this.state.peerConnections) {
            result.push(<div>
                <video className="embed-responsive-item" id={"remoteVideo" + id} autoPlay={true} key={id}/>
            </div>)
        }
        return result;
    }

    render() {
        return (<div>
            <div>
                <button onClick={this.startBroadcast} className="btn btn-dark">Start broadcast</button>
                <button onClick={this.call} className="btn btn-outline-info" disabled={this.state.callDisabled}>Call
                </button>
                <button onClick={this.join} className="btn btn-outline-success">Join</button>
                <button onClick={this.hangup} className="btn btn-outline-warning"
                        disabled={this.state.hangupDisabled}>Hangup
                </button>
            </div>
            <div className="container-fluid">
                <div className="row justify-content-between">
                    <div>
                        <video className="embed-responsive-item" id="localVideo" autoPlay={true}/>
                    </div>
                    {this.renderRemoteVideo()}
                </div>
            </div>
        </div>)
    }
}

export default VideoChat;
