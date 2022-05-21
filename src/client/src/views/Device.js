import { useState, useContext, useEffect, useRef } from "react";
import "./device.css";
import { DataContext } from "../contexts/DataContext";
import { TypeContext } from "../contexts/TypeContext";
import { ConfigContext } from "../contexts/ConfigContext";
import { AuthContext } from "../contexts/AuthContext";
import { TypeModalContext } from "../contexts/TypeModalContext";
import { DeviceContext } from "../contexts/DeviceContext";

import devicelogo from "../assets/device.jpg";
import PHImage from "../assets/PH.png";
import React, { Component } from "react";

import { io } from "socket.io-client";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import addButton from "../assets/addButton.png";
import SingleType from "../type/SingleType";
import SingleTypeModal from "../type/SingleTypeModal";
import AddTypeModal from "../type/AddTypeModal";
import UpdateTypeModal from "../type/UpdateTypeModal";
import { SetVolumeContext } from "../contexts/SetVolumeContext";
import Switch from "react-switch";
import Select from "react-select";

import Toast from "react-bootstrap/Toast";

const Device = () => {
  const {
    typeState: { configtype, config, configLoading },
    getConfigType,
    setShowAddTypeModal,
    showToast: { show, message, Type },
    setShowToast,
  } = useContext(TypeContext);

  const {
    configState: {
      currentConfig: { type, TDS, dead_TDS, PH, dead_PH, nutri_Ratio },
    },
    getConfigData,
    currentConfig,
  } = useContext(ConfigContext);

  const {
    typeModalState: { typeModal },
    getTypeModal,
  } = useContext(TypeModalContext);

  const {
    setVolumeState: {
      setVolume: {
        _id,
        Nutri_A_full,
        Nutri_B_full,
        Acid_So_full,
        Base_So_full,
        createdAt,
      },
    },
    getSetVolume,
    addSetVolume,
    updateVolume,
    setVolume,
  } = useContext(SetVolumeContext);

  /*---------------get device ----------------*/
  const {
    deviceState: { deviceData },
    getDevice,
  } = useContext(DeviceContext);
  var optionsDevice = [];
  for (let i = 0; i < deviceData.length; i++) {
    let value = [];
    value = { value: deviceData[i].device, label: `Device ${i + 1}` };
    optionsDevice.push(value);
  }

  const [selectDevice, setselectDevice] = useState("Device 1");
  // //get last data
  useEffect(() => getDevice(), []);

  const OnChangeDevice = (event) => {
    setselectDevice(event.label);
  };

  var selectedDevice;
  let bodyLabelDevice = null;
  for (let i = 0; i < deviceData.length; i++) {
    if (selectDevice === optionsDevice[i].label) {
      selectedDevice = deviceData[i].device;
      bodyLabelDevice = deviceData[i].name;
    }
  }

  /*-----------------------------------------*/

  useEffect(() => getConfigData(selectedDevice), [selectedDevice]);
  useEffect(() => getConfigType(), []);
  useEffect(() => getTypeModal(), []);
  useEffect(() => getSetVolume(selectedDevice), [selectedDevice]);

  // Add Device

  const { addDevices } = useContext(DeviceContext);

  const [newDevice, setNewDevice] = useState({
    device: " ",
  });

  const { deviceID, name } = newDevice;

  const onChangeNewDeviceForm = (event) =>
    setNewDevice({
      ...newDevice,
      [event.target.name]: event.target.value,
    });

  const onSubmmit = async (event) => {
    event.preventDefault();
    try {
      const { success, message } = await addDevices(newDevice);
      setNewDevice({ deviceID: "", name: "" });
      setShowToast({ show: true, message, Type: success ? "info" : "danger" });
    } catch (error) {
      console.log(error);
    }
  };

  // Set Config For Device

  const [newConfig, newSetConfig] = useState({
    TDS: "",
    dead_TDS: "",
    PH: "",
    dead_PH: "",
    nutri_Ratio: "",
  });

  const { newTDS, newDead_TDS, newPH, newDead_PH, newnutri_Ratio } = newConfig;
  const { configManual } = useContext(ConfigContext);
  const onSubmmitConfigManual = async (event) => {
    event.preventDefault();

    try {
      const { success, message } = await configManual(newConfig);
      newSetConfig({
        TDS: " ",
        dead_TDS: " ",
        PH: " ",
        dead_PH: " ",
        nutri_Ratio: " ",
      });
      setShowToast({ show: true, message, Type: success ? "info" : "danger" });
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeNewSetConfigForm = (event) =>
    newSetConfig({
      ...newConfig,
      device: selectedDevice,
      type: "Manual",
      [event.target.name]: event.target.value,
    });

  //socket io
  const {
    authState: {
      user: { username },
      user,
    },
  } = useContext(AuthContext);
  const socket = useRef();

  useEffect(() => {
    socket.current = io("ws://localhost:5200", {
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 10,
    });
    socket.current.on();
  }, []);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      //sconsole.log(users);
    });
    socket.current.emit("getConfig", user._id);
    socket.current.on("sendConfig", (configManual) => {
      // setData(configManual);
    });
  }, [username]);

  //Personal Type Box

  //initialize option for personal setting

  var options = [];
  for (let i = 0; i < config.length; i++) {
    let value = [];
    value = { value: config[i]._id, label: config[i].type };
    options.push(value);
  }
  const [selectTypePersonalState, setSelectTypePersonalState] = useState("");
  const onChangePersonal = (event) => setSelectTypePersonalState(event.value);
  let body12 = null;
  if (options !== null) {
    for (let i = 0; i < config.length; i++) {
      if (options[i].value === selectTypePersonalState) {
        body12 = (
          <SingleType
            config={
              (config[i] = { ...config[i], selectedDevice: selectedDevice })
            }
          />
        );
      }
    }
  }

  let body1 = null;
  if (configLoading) {
    body1 = (
      <>
        <h1>Loading</h1>
      </>
    );
  } else if (config.length === 0) {
    body1 = (
      <>
        <div className="PersonalTypeBox">
          <div className="title-new-vegetable">
            Click button below to add your profile
          </div>
          <Button
            className="button-new-vegetable"
            variant="primary"
            onClick={setShowAddTypeModal.bind(this, true)}
          >
            Add new vegetables
          </Button>
        </div>
      </>
    );
  } else {
    body1 = (
      <>
        <div className="PersonalTypeBox">
          <div className="PersonalTitle">Personal profile</div>

          <div className="personalAndButton">
            <Select
              options={options}
              onChange={onChangePersonal}
              className="selectPersonalType"
            />
            <OverlayTrigger
              placement="left"
              overlay={<Tooltip>Add a new profile</Tooltip>}
            >
              <Button
                className="btn-floating"
                onClick={setShowAddTypeModal.bind(this, true)}
              >
                <img src={addButton} height="15" width="15" />
              </Button>
            </OverlayTrigger>
          </div>

          {body12}
        </div>
      </>
    );
  }

  //Global Type Box

  //initialize option for global setting
  var optionsGlobal = [];
  for (let i = 0; i < typeModal.length; i++) {
    let value = [];
    value = { value: typeModal[i]._id, label: typeModal[i].typeModal };
    optionsGlobal.push(value);
  }

  const [selectTypeGlobalState, setSelectTypeGlobalState] = useState("");
  const onChangeGlobal = (event) => setSelectTypeGlobalState(event.value);
  let bodyTypeGlobal = null;
  if (optionsGlobal !== null) {
    for (let i = 0; i < typeModal.length; i++) {
      if (optionsGlobal[i].value === selectTypeGlobalState) {
        bodyTypeGlobal = (
          <SingleTypeModal
            typeModal={
              (typeModal[i] = {
                ...typeModal[i],
                selectedDevice: selectedDevice,
              })
            }
          />
        );
      }
    }
  }
  let bodyGlobal = null;
  if (typeModal.length !== 0) {
    bodyGlobal = (
      <>
        <div className="GlobalTypeBox">
          <div className="globalTitle">Recommend profile</div>
          <Select options={optionsGlobal} onChange={onChangeGlobal} />
          {bodyTypeGlobal}
        </div>
      </>
    );
  }

  // Toggle Button Manual Config
  const [checked, setChecked] = useState(false);
  let bodyConfigManual = null;
  const onChangeChecked = () => {
    setChecked(!checked);
  };
  if (checked == true) {
    bodyConfigManual = (
      <>
        <form onSubmit={onSubmmitConfigManual}>
          <div className="PH-config">
            <div className="pH">
              <h2>Current PH value set: {PH}</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                max="14"
                className="text"
                placeholder="Set PH value..."
                name="PH"
                value={newPH}
                onChange={onChangeNewSetConfigForm}
                required
              />
            </div>
            <div className="dead_PH">
              <h2>Current PH threshold value: {dead_PH}</h2>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1"
                className="text"
                placeholder="PH threshold..."
                name="dead_PH"
                value={newDead_PH}
                onChange={onChangeNewSetConfigForm}
                required
              />
            </div>
          </div>
          <div className="TDS-config">
            <div className="tDS">
              <h2>Current TDS value: {TDS} ppm</h2>
              <input
                type="number"
                step="0.01"
                min="100"
                max="2000"
                className="text"
                placeholder="TDS value..."
                name="TDS"
                value={newTDS}
                onChange={onChangeNewSetConfigForm}
                required
              />
            </div>
            <div className="dead_TDS">
              <h2>Current TDS threshold value: {dead_TDS} ppm</h2>
              <input
                type="number"
                step="0.01"
                min="50"
                max="300"
                className="text"
                placeholder="TDS threshold..."
                name="dead_TDS"
                value={newDead_TDS}
                onChange={onChangeNewSetConfigForm}
                required
              />
            </div>
          </div>
          {/* <img src={PHImage} /> */}
          <div className="nutriRatio">
            <h2>Current nutri ratio value: {nutri_Ratio} </h2>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="10"
              className="text"
              placeholder="Nutri ratio value..."
              name="nutri_Ratio"
              value={newnutri_Ratio}
              onChange={onChangeNewSetConfigForm}
              required
            />
          </div>
          <input type="submit" className="button" value="Submit" />
        </form>
      </>
    );
  }

  // set volume of bottles
  const [newVolume, newSetVolume] = useState({
    Nutri_A_full: " ",
    Nutri_B_full: " ",
    Acid_So_full: " ",
    Base_So_full: " ",
  });
  const { newNutri_A_full, newNutri_B_full, newAcid_So_full, newBase_So_full } =
    newVolume;
  const onSubmmitVolumeBottles = async (event) => {
    event.preventDefault();
    try {
      const { success, message } = await addSetVolume(newVolume);
      newSetVolume({
        Nutri_A_full: " ",
        Nutri_B_full: " ",
        Acid_So_full: " ",
        Base_So_full: " ",
      });
      setShowToast({ show: true, message, Type: success ? "info" : "danger" });
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeNewSetVolumeForm = (event) =>
    newSetVolume({
      ...newVolume,
      device: selectedDevice,
      Water_full: "0",
      [event.target.name]: event.target.value,
    });

  const onPutVolumeBottles = async (event) => {
    event.preventDefault();
    try {
      const { success, message } = await updateVolume(newVolume);
      newSetVolume({
        Nutri_A_full: " ",
        Nutri_B_full: " ",
        Acid_So_full: " ",
        Base_So_full: " ",
      });
      setShowToast({ show: true, message, Type: success ? "info" : "danger" });
    } catch (error) {
      console.log(error);
    }
  };
  const onPutNewSetVolumeForm = (event) =>
    newSetVolume({
      ...newVolume,
      _id,
      selectedDevice,
      Water_full: "0",
      [event.target.name]: event.target.value,
      createdAt,
    });

  // Toggle Button Volume Bottles

  const [checkedBottle, setCheckedBottle] = useState(false);
  let bodyVolumeBottle = null;
  const onChangeBottleChecked = () => {
    setCheckedBottle(!checkedBottle);
  };
  if (checkedBottle == true) {
    if (Nutri_A_full === null) {
      bodyVolumeBottle = (
        <form onSubmit={onSubmmitVolumeBottles}>
          <div className="PH-config">
            <div className="pH">
              {/* <h2>Volume of Nutri A bottle: {Nutri_A_full} ml</h2> */}
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Nutri A bottle..."
                name="Nutri_A_full"
                value={newNutri_A_full}
                onChange={onChangeNewSetVolumeForm}
                required
              />
            </div>
            <div className="dead_PH">
              {/* <h2>Volume of Nutri B bottle: {Nutri_B_full} ml</h2> */}
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Nutri B bottle..."
                name="Nutri_B_full"
                value={newNutri_B_full}
                onChange={onChangeNewSetVolumeForm}
                required
              />
            </div>
          </div>

          <div className="TDS-config">
            <div className="tDS">
              {/* <h2>Current volume of Acid bottle: {Acid_So_full} ml</h2> */}
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Acid value..."
                name="Acid_So_full"
                value={newAcid_So_full}
                onChange={onChangeNewSetVolumeForm}
                required
              />
            </div>
            <div className="dead_TDS">
              {/* <h2>Current volume of Bazo bottle: {Base_So_full} ml</h2> */}
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Base bottle..."
                name="Base_So_full"
                value={newBase_So_full}
                onChange={onChangeNewSetVolumeForm}
                required
              />
            </div>
          </div>
          <input type="submit" className="button" value="Submit" />
        </form>
      );
    } else {
      bodyVolumeBottle = (
        <form onSubmit={onPutVolumeBottles}>
          <div className="PH-config">
            <div className="pH">
              <h2>Volume of Nutri A bottle: {Nutri_A_full} ml</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Nutri A bottle..."
                name="Nutri_A_full"
                value={newNutri_A_full}
                onChange={onPutNewSetVolumeForm}
                required
              />
            </div>
            <div className="dead_PH">
              <h2>Volume of Nutri B bottle: {Nutri_B_full} ml</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Nutri B bottle..."
                name="Nutri_B_full"
                value={newNutri_B_full}
                onChange={onPutNewSetVolumeForm}
                required
              />
            </div>
          </div>

          <div className="TDS-config">
            <div className="tDS">
              <h2>Volume of Acid bottle: {Acid_So_full} ml</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Acid value..."
                name="Acid_So_full"
                value={newAcid_So_full}
                onChange={onPutNewSetVolumeForm}
                required
              />
            </div>
            <div className="dead_TDS">
              <h2>Volume of Base bottle: {Base_So_full} ml</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                className="text"
                placeholder="Base bottle..."
                name="Base_So_full"
                value={newBase_So_full}
                onChange={onPutNewSetVolumeForm}
                required
              />
            </div>
          </div>
          <input type="submit" className="button" value="Submit" />
        </form>
      );
    }
  }
  return (
    <>
      <div className="main">
        <div className="config">
          <div className="deviceName1">Name of device: {bodyLabelDevice}</div>
          <div className="select">
            <Select
              options={optionsDevice}
              className="selecttime"
              placeholder={<div>{selectDevice}</div>}
              onChange={OnChangeDevice}
            />
          </div>

          <div className="title-new-vegetable">Current setting is {type}</div>

          <div>
            <div className="titleGlobal-Personal">
              Choose your config by your profile or recommend profile
            </div>
            <div className="optionTypePersonalGlobal">
              {body1}
              {bodyGlobal}
            </div>
          </div>

          <>
            <AddTypeModal />
            {configtype !== null && <UpdateTypeModal />}
            <Toast
              show={show}
              style={{ position: "fixed", top: "20%", right: "10px" }}
              className={`bg-${Type} text-white`}
              onClose={setShowToast.bind(this, {
                show: false,
                message: "",
                type: null,
              })}
              delay={3000}
              autohide
            >
              <Toast.Body>
                <strong>{message}</strong>
              </Toast.Body>
            </Toast>
          </>
        </div>

        <>
          <div className="boundingboxManual">
            <div className="configManualTitle">Config value manual</div>
            <Switch
              checked={checked}
              onChange={onChangeChecked}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={17}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={35}
              className="react-switch"
              id="material-switch"
            />
          </div>

          {bodyConfigManual}
        </>
        <>
          <div className="boundingboxManual">
            <div className="configManualTitle">Config bottles volume</div>
            <Switch
              checked={checkedBottle}
              onChange={onChangeBottleChecked}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={17}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={35}
              className="react-switch"
              id="material-switch"
            />
          </div>

          {bodyVolumeBottle}
        </>
      </div>

      <div className="addDevice">
        <div className="device-box">
          <img src={devicelogo} />
          <div className="form">
            <h1>Add your new device</h1>
            <form onSubmit={onSubmmit}>
              <div>Device ID</div>
              <input
                type="text"
                className="text"
                placeholder="Device ID..."
                name="device"
                value={deviceID}
                onChange={onChangeNewDeviceForm}
                required
              />
              <div>Set name of device </div>
              <input
                type="text"
                className="text"
                placeholder="Set name of device..."
                name="name"
                value={name}
                onChange={onChangeNewDeviceForm}
                required
              />
              <input type="submit" className="addButton" value="Add device  " />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default Device;
