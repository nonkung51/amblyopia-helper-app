import React from 'react';
import axios from 'axios';
import { Text, View, Button } from 'react-native';
import { Camera, Permissions, Speech } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    isLoading: '',
    answerText: '',
    inProgress: null
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  async takePic () {
    if (this.camera) {
      this.setState({
        isLoading: 'โปรดรอสักครู่...',
        answerText: '',
      })
      let photo = await this.camera.takePictureAsync({base64: true});
      this.uploadImageAsync(photo.uri)
    }
  }

  _speak = () => {
    const start = () => {
      this.setState({ inProgress: true });
    };
    const complete = () => {
      this.state.inProgress && this.setState({ inProgress: false });
    };

    Speech.speak(this.state.answerText, {
      language: 'th-TH',
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    });
  };

  async uploadImageAsync(uri) {

    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('image', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    let options = {
        method: 'POST',
        body: formData,
      };

    fetch('http://amblyopia-helper.herokuapp.com/mbn/', options)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.MBN[0] === 'D') {
          this.setState({
            isLoading: '',
            answerText: 'ระบบไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง'
          })
          this._speak()
        } else {
          this.setState({
            isLoading: '',
            answerText: responseJson.MBN
          })
          this._speak()
        }
      })
      .catch(() => this.setState({answerText: 'โปรดลองใหม่อีกครั้ง'}))

  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 6 }} type={this.state.type} ref={ref => { this.camera = ref; }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
              <Button
                onPress={this.takePic.bind(this)}
                color='green'
                title='ถ่ายภาพ'
                />
            </View>
          </Camera>
          <View
            style={{
              flex:1,
              backgroundColor: 'gray',
              alignItems: 'center'
            }}>
            <Text
              style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
              { this.state.isLoading }
            </Text>
            <Text
              style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
              ผลลัพท์
            </Text>
            <Text
              style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
              { this.state.answerText }
            </Text>
          </View>
        </View>
      );
    }
  }
}
