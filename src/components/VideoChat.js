import React, {Component} from "react";


let FROM_ID;

class VideoChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            localVideo: null,
            remoteVideo: null,
            localStream: null,
            socketId: this.props.socket.id,
            peerConnection: new Map()
        };
        // this.peerConnection = new RTCPeerConnection();
        // this.peerConnection = new Map();
        this.fromId = null;
        // this.peerConnection = [];
        // this.remotePeerConnection = new RTCPeerConnection();
        this.startLocalVideo = this.startLocalVideo.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);
        this.onClick = this.onClick.bind(this);
        this.call = this.call.bind(this);
        this.props.socket.on("webrtc", (fromId, data) => {
            console.log("webrtc", fromId, data);
            let currentPeerConnection = this.state.peerConnection.get(fromId);
            this.fromId = fromId;
            FROM_ID = fromId;
            // eslint-disable-next-line default-case
            switch (data.type) {
                case "candidate":
                    let candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
                    // this.setState({fromId});
                    // this.peerConnection.forEach(pc =>
                    currentPeerConnection.addIceCandidate(candidate)
                        .then(() => console.log("add ice candidate succeeded"))
                        .catch(err => console.log(err));
                    // );
                    break;
                case "offer":
                    // this.remotePeerConnection = new RTCPeerConnection();
                    // this.remotePeerConnection.
                    // let currentPeerConnection = this.peerConnection.get(fromId);
                    // this.peerConnection.forEach(pc => {
                    currentPeerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err));
                    this.createAnswer(fromId, currentPeerConnection);
                    // });
                    // this.setState()
                    break;
                case "answer":
                    // this.remotePeerConnection = new RTCPeerConnection();
                    // this.remotePeerConnection.
                    // this.peerConnection.forEach(pc =>
                    currentPeerConnection.setRemoteDescription(new RTCSessionDescription(data))
                        .then(() => console.log("set remote description succeeded"))
                        .catch(err => console.log(err))
                // );
            }
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

        //1 this.peerConnection.onicecandidate = this.onIceCandidate;
        // this.peerConnection.ontrack = this.gotRemoteStream;
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.members) {
            // let length = Object.keys(nextProps.members).length;
            // console.log(length);
            // const pc_config = {
            //     "iceServers": [{"url": "stun:stun.l.google.com:19302"}],
            //     "optional": [{"DtlsSrtpKeyAgreement": true}]
            // };
            // const pc_constraints = {};
            let {peerConnection} = this.state;
            for (let member in nextProps.members) {
                if (member !== this.state.socketId
                    && !peerConnection.has(member)) {
                    let pc = new RTCPeerConnection();
                    pc.onicecandidate = this.onIceCandidate;
                    pc.ontrack = this.gotRemoteStream;
                    peerConnection.set(member, pc);
                }
            }
            this.setState(peerConnection);
            // for (let i = 0; i < length - 1; i++) {
            //     // console.log(member);
            //     // this.props.members.forEach(() => {
            //     let pc = new RTCPeerConnection();
            //     pc.onicecandidate = this.onIceCandidate;
            //     pc.ontrack = this.gotRemoteStream;
            //     // const id = pc.peerIdentity.then((res) => console.log(res)).catch(err => console.log(err));
            //     const id = "id" + i;
            //     this.peerConnection.set(id, pc);
            //     // console.log(id);
            //     // .then(res => console.log(res)).catch(err => console.log(err))
            //     // this.peerConnection.push(pc);
            //     // })
            // }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.localStream !== prevState.localStream) {
            this.state.peerConnection.forEach(pc =>
                this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream)));
            // this.state.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.state.localStream));
        }
        if (this.props.members !== prevProps.members) {
            let remoteVideo = new Map();
            for (let [id, peer] of this.state.peerConnection) {
                remoteVideo.set(id, document.getElementById("remoteVideo" + id));
            }
            this.setState({remoteVideo});
        }
    }

    onClick(e) {
        // this.peerConnection.forEach(v)
        this.startLocalVideo();
        // if (this.state.localStream) {
        //     this.peerConnection.forEach(pc =>
        //         this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream)));
        // }
        // this.state.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.state.localStream));
        // this.peerConnection.forEach(pc =>
        //     this.state.localStream.getTracks().forEach(track => pc.addTrack(track, this.state.localStream)));
    }

    createOffer(id, pc) {
        console.log(id, pc);
        console.log("creating offer");
        pc.createOffer()
            .then((description) => {
                return pc.setLocalDescription(description)
            })
            .then(() => {
                console.log(pc.localDescription);
                this.props.socket.emit("webrtc", id, pc.localDescription);
                console.log("ok!");
            })
            .catch(err => console.log("creating offer failed", err));
    }

    createAnswer(id, pc) {
        console.log(id, pc);
        console.log("creating answer");
        pc.createAnswer()
            .then((description) => {
                return pc.setLocalDescription(description)
                // .catch(err => console.loog("creating offer failed", err));
            })
            .then(() => {
                this.props.socket.emit("webrtc", id, pc.localDescription);
                console.log("ok!")
            })
            .catch(err => console.log("creating answer failed", err));
    }

    onIceCandidate(e) {
        const fromId = this.fromId;
        // || this.state.socketId;
        // const fromId = FROM_ID;
        console.log("ice candidate", e, fromId);
        let identity;
        for (let [id, peer] of this.state.peerConnection) {
            if (e.currentTarget === peer) {
                identity = id;
                break;
            }
        }
        // if (!fromId) {
        // for (let member in this.state.peerConnection) {
        // if (member !== this.state.socketId) {
        // console.log(member);
        if (e.candidate) {
            this.props.socket.emit("webrtc", identity, {
                type: 'candidate',
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate
            })
        }
        // }
        // }
    }

    // else {
    //     if (e.candidate) {
    //         this.props.socket.emit("webrtc", fromId, {
    //             type: 'candidate',
    //             label: e.candidate.sdpMLineIndex,
    //             id: e.candidate.sdpMid,
    //             candidate: e.candidate.candidate
    //         })
    //     }
    // }

    call() {
        // console.log(this.state.socketId);
        this.state.peerConnection.forEach((pc, id) => this.createOffer(id, pc));
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
            </div>
        </div>)
    }
}

export default VideoChat;
