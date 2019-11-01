import React, {Component} from "react";


class VideoChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            localVideo: null,
            remoteVideo: new Map(),
            localStream: null,
            socketId: this.props.socket.id,
            peerConnection: new Map()
        };
        this.fromId = null;
        this.startLocalVideo = this.startLocalVideo.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);
        this.onClick = this.onClick.bind(this);
        this.call = this.call.bind(this);
        this.join = this.join.bind(this);
        this.hangup = this.hangup.bind(this);
        this.props.socket.on("webrtc signal", (fromId, data) => {
            console.log("webrtc", fromId, data);
            let currentPeerConnection = this.state.peerConnection.get(fromId);
            console.log(currentPeerConnection);
            this.fromId = fromId;
            // eslint-disable-next-line default-case
            switch (data.type) {
                case "candidate":
                    let candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
                    currentPeerConnection.addIceCandidate(candidate)
                        .then(() => console.log("add ice candidate succeeded"))
                        .catch(err => console.log(err));
                    break;
                case "offer":
                    currentPeerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
                    this.createAnswer(fromId, currentPeerConnection);
                    break;
                case "answer":
                    currentPeerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
                // this.state.localStream.getTracks().forEach(track =>
                //     currentPeerConnection.addTrack(track, this.state.localStream));
            }
        });
        this.props.socket.on("webrtc make offer", members => {
            console.log("make offer:", members);
            members.forEach(member => {
                let pc = this.state.peerConnection.get(member);
                // this.state.peerConnection.forEach(pc =>
                //     this.state.localStream.getTracks().forEach(track =>
                //         pc.addTrack(track, this.state.localStream)));
                this.createOffer(member, pc);
                this.props.socket.emit("webrtc offer")
            });
        })
    }

    componentDidMount() {
        console.log("did mount");
        this.setState({
            localVideo: document.getElementById("localVideo"),
            // remoteVideo: document.getElementById("remoteVideo"),
        });
        let remoteVideo = new Map();

        for (let [id, peer] of this.state.peerConnection) {
            remoteVideo.set(id, document.getElementById("remoteVideo" + id));
        }
        this.setState({remoteVideo});
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.members) {
            let {peerConnection} = this.state;
            for (let member in nextProps.members) {
                if (member !== this.state.socketId
                    && !peerConnection.has(member)) {
                    let pc = new RTCPeerConnection();
                    pc.ontrack = this.gotRemoteStream;
                    pc.onicecandidate = this.onIceCandidate;
                    peerConnection.set(member, pc);
                }
            }
            this.setState(peerConnection);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("did update");
        // console.log(prevState.peerConnection, prevState.localStream);
        // console.log(this.state.peerConnection, this.state.localStream);
        // if()
        if (this.state.localStream !== prevState.localStream) {
            this.state.peerConnection.forEach(pc =>
                this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream)));
            // console.log(this.state.peerConnection, this.state.localStream);
            // this.state.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.state.localStream));
        }

        if (this.props.members !== prevProps.members) {
            let {remoteVideo} = this.state;
            for (let [id, peer] of this.state.peerConnection) {
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

    onClick(e) {
        this.startLocalVideo();
    }

    createOffer(id, pc) {
        console.log(id, pc);
        console.log("creating offer");
        console.log("stream:", this.state.localStream);
        pc.createOffer()
            .then((description) => {
                return pc.setLocalDescription(description)
            })
            .then(() => {
                console.log(pc.localDescription);
                this.props.socket.emit("webrtc signal", id, pc.localDescription);
                console.log("ok!");
            })
            .catch(err => console.log("creating offer failed", err));
    }

    createAnswer(id, pc) {
        console.log(id, pc);
        console.log("creating answer");
        console.log("stream:", this.state.localStream);
        pc.createAnswer()
            .then((description) => {
                return pc.setLocalDescription(description)
                // .catch(err => console.loog("creating offer failed", err));
            })
            .then(() => {
                this.props.socket.emit("webrtc signal", id, pc.localDescription);
                console.log("ok!")
            })
            .catch(err => console.log("creating answer failed", err));
    }

    onIceCandidate(e) {
        const fromId = this.fromId;
        console.log("ice candidate", e, fromId);
        let identity;
        for (let [id, peer] of this.state.peerConnection) {
            if (e.currentTarget === peer) {
                identity = id;
                break;
            }
        }
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
    }

    join() {
        this.props.socket.emit("webrtc join");
    }

    hangup() {
        this.state.peerConnection.forEach(pc => pc.close());
    }

    startLocalVideo() {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then(stream => {
                // this.setState({})
                let {localVideo} = this.state;
                localVideo.srcObject = stream;
                this.setState({
                    localVideo: localVideo,
                    localStream: stream,
                });
            })
            .catch(err => console.log(err));
    }

    gotRemoteStream(e) {
        console.log("Remote stream");
        console.log(e.currentTarget);
        let identity;
        for (let [id, peer] of this.state.peerConnection) {
            if (e.currentTarget === peer) {
                identity = id;
                break;
            }
        }
        console.log(e.streams);
        if (this.state.remoteVideo.srcObject !== e.streams[0]) {
            let {remoteVideo} = this.state;
            console.log(identity);
            console.log(remoteVideo);
            console.log(remoteVideo.get(identity));
            remoteVideo.get(identity).srcObject = e.streams[0];
            // Object.assign({},)
            this.setState({remoteVideo: remoteVideo});
            // console.log('pc2 received remote stream');
        }
    }

    renderRemoteVideo() {
        let result = [];
        // for (let i = 0; i < this.props.members.lenght - 1; i++) {
        for (let [id, peer] of this.state.peerConnection) {
            result.push(<video id={"remoteVideo" + id} autoPlay={true}/>)
        }
        // }
        return result;
    }

    render() {
        console.log("render", this.props);
        console.log(this.state.peerConnection);
        console.log("this.state", this.state);
        return (<div>
            <div>
                <video id="localVideo" autoPlay={true}/>
                {/*<video id="remoteVideo" autoPlay={true}/>*/}
                {this.renderRemoteVideo()}
            </div>
            <div>
                <button onClick={this.onClick}>Start broadcast</button>
                <button onClick={this.call}>Call</button>
                <button onClick={this.join}>Join</button>
                <button onClick={this.hangup}>Hangup</button>
            </div>
        </div>)
    }
}

export default VideoChat;
