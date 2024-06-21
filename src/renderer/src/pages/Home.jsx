import React, { useState } from 'react';
import InputSlider from 'react-input-slider';
import NavBar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const Home = () => {
  const [age, setPatientAge] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [medName, setMedName] = useState('');
  const [volumeOfFluid, setVolumeOfFluid] = useState('');
  const [dosesTaken, setDosesTaken] = useState('');
  const [flowRate, setFlowRate] = useState('');
  const [fluidNumber, setFluidNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [customAlarmPercentage, setCustomAlarmPercentage] = useState(50); // Default value is 50

  const handleSubmit = async (event) => {
    event.preventDefault();
    const patient = {
      patientname: patientName,
      age,
      wardnumber: wardNumber,
      bednumber: bedNumber,
      medname: medName,
      volumeoffluid: volumeOfFluid,
      dosesTaken,
      flowRate,
      fluidNumber,
      customAlarmPercentage,
    };
    try {
      const result = await window.api.addPatient(patient);
      console.log(result);
      toast.success('Patient added successfully!');
      
      // Reset all form fields
      setPatientName('');
      setPatientAge('');
      setWardNumber('');
      setBedNumber('');
      setMedName('');
      setVolumeOfFluid('');
      setDosesTaken('');
      setFlowRate('');
      setFluidNumber('');
      setCustomAlarmPercentage(50);
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast.error('Failed to add patient!');
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-gray-100 min-h-screen">
      <NavBar/>
      <h1 className="text-md font-semibold my-10">PATIENT ENTRY</h1>
      <form className="w-2/3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            name="patientName"
            placeholder="Patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            name="patientAge"
            placeholder="Age"
            type="number"
            value={age}
            onChange={(e) => setPatientAge(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="wardNumber"
            placeholder="Ward Number"
            value={wardNumber}
            onChange={(e) => setWardNumber(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            name="bedNumber"
            placeholder="Bed Number"
            value={bedNumber}
            onChange={(e) => setBedNumber(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <h2 className="text-lg font-semibold mt-14 mb-6 text-center">Dose Information</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            name="medName"
            placeholder=" Medicine Name"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            name="/ml"
            placeholder="Volume of fluid (mL)"
            type="number"
            value={volumeOfFluid}
            onChange={(e) => setVolumeOfFluid(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="dosesTaken"
            placeholder="Number of doses taken"
            type="number"
            value={dosesTaken}
            onChange={(e) => setDosesTaken(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            name="flowRate"
            placeholder="FlowRate(mL/sec)"
            type="number"
            value={flowRate}
            onChange={(e) => setFlowRate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <input
            name="fluidNumber"
            placeholder="Fluid Number"
            value={fluidNumber}
            onChange={(e) => setFluidNumber(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          {/* Seekbar/slider for custom alarm percentage */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Custom Alarm Percentage:</label>
            <InputSlider
              axis="x"
              x={customAlarmPercentage}
              onChange={({ x }) => setCustomAlarmPercentage(x)}
              xmin={1}
              xmax={99}
              styles={{
                track: {
                  backgroundColor: '#d6d6d6',
                  height: '8px',
                },
                active: {
                  backgroundColor: '#2563EB',
                  height: '8px',
                },
                thumb: {
                  backgroundColor: '#2563EB',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 1px #2563EB, 0 0 0 2px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            <span>{customAlarmPercentage}%</span>
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white justify-center items-center flex font-bold py-2 px-4 rounded mt-20 ml-96" type="submit">
          Add Another Patient
        </button>
      </form>
      <Toaster />
    </div>
  );
};

export default Home;
