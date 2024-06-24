import React, { useState, useEffect } from 'react';
import InputSlider from 'react-input-slider';
import NavBar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import alarmSound from '../assets/Alarm.mp3'

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
  const [customAlarmPercentage, setCustomAlarmPercentage] = useState(50); 
  const [dropFactor, setDropFactor] = useState(10);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, options) => {
    const audio = new Audio(alarmSound);
    const playAlarm = () => {
      audio.play();
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 10000); // Play for 10 seconds
    };
    if (Notification.permission === 'granted') {
      new Notification(title, options);
      playAlarm();
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, options);
          playAlarm();
        }
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      console.log(now)
      const entries = JSON.parse(localStorage.getItem('patientEntries')) || [];
      entries.forEach((entry, index) => {
        const fiftyPercentTime = entry.finishTime - (entry.finishTime - entry.startTime) * 0.5;
        const ninetyPercentTime = entry.finishTime - (entry.finishTime - entry.startTime) * 0.1;
        const customAlarmTime = entry.finishTime - (entry.finishTime - entry.startTime) * (entry.customAlarmPercentage / 100);

        if (now >= fiftyPercentTime && !entry.fiftyPercentToastShown) {
          showNotification(`50% time is up for ${entry.patientName}`, {
            body: `Medication: ${entry.medName}`,
            requireInteraction: true,
          });

          entries[index] = { ...entry, fiftyPercentToastShown: true };
          localStorage.setItem('patientEntries', JSON.stringify(entries));
        } else if (now >= ninetyPercentTime && !entry.ninetyPercentToastShown) {
          showNotification(`90% time is up for ${entry.patientName}`, {
            body: `Medication: ${entry.medName}`,
            requireInteraction: true,
          });

          entries[index] = { ...entry, ninetyPercentToastShown: true };
          localStorage.setItem('patientEntries', JSON.stringify(entries));
        } else if (now >= customAlarmTime && !entry.customAlarmToastShown) {
          showNotification(`Time is ${entry.customAlarmPercentage}% up for ${entry.patientName}`, {
            body: `Medication: ${entry.medName}`,
            requireInteraction: true,
          });

          entries[index] = { ...entry, customAlarmToastShown: true };
          localStorage.setItem('patientEntries', JSON.stringify(entries));
        } else if (now >= entry.finishTime && !entry.finishToastShown) {
          showNotification(`Time's up for ${entry.patientName}`, {
            body: `Medication: ${entry.medName}`,
            requireInteraction: true,
          });

          const newEntries = entries.filter((e) => e.finishTime !== entry.finishTime);
          newEntries[index] = { ...entry, finishToastShown: true };
          localStorage.setItem('patientEntries', JSON.stringify(newEntries));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const roundToMinute = (date) => {
    date.setSeconds(0, 0); // Set seconds and milliseconds to 0
    return date;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const timeInSeconds = (volumeOfFluid * dropFactor) / flowRate;
    const currentTime = new Date().getTime();
    const finishTime = new Date(currentTime + timeInSeconds * 1000);
    const formattedTime = finishTime.toISOString();
    const halfTime = roundToMinute(new Date(currentTime + (timeInSeconds * 0.5) * 1000));
    const ninetyPercentTime = roundToMinute(new Date(currentTime + (timeInSeconds * 0.9) * 1000));
    const customTime = roundToMinute(new Date(currentTime + (timeInSeconds * (customAlarmPercentage / 100)) * 1000));

    const patient = {
      patientname:patientName,
      age,
      wardnumber:wardNumber,
      bednumber:bedNumber,
      medname:medName,
      volumeoffluid:volumeOfFluid,
      dosesTaken,
      flowRate,
      fluidNumber,
      customAlarmPercentage,
      startTime: currentTime,
      finishTime:formattedTime,
      halfTime: halfTime.getTime(),
      ninetyPercentTime: ninetyPercentTime.getTime(),
      customTime: customTime.getTime(),
    };

    const patientLocal ={
      patientName,
      age,
      medName,
      customAlarmPercentage,
      finishTime:finishTime.getTime(),
      halfTime:halfTime.getTime(),
      ninetyPercentTime:ninetyPercentTime.getTime(),
      customTime:customTime.getTime(),
      startTime:currentTime,
    }

    try {
      const result = await window.api.addPatient(patient);
      console.log(result);
      toast.success('Patient added successfully!');

      const existingEntries = JSON.parse(localStorage.getItem('patientEntries')) || [];
      existingEntries.push(patientLocal);
      localStorage.setItem('patientEntries', JSON.stringify(existingEntries));

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
            placeholder=" Solution Name"
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
            placeholder="FlowRate(drops/sec)"
            type="number"
            value={flowRate}
            onChange={(e) => setFlowRate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 items-center">
          <input
            name="fluidNumber"
            placeholder="Fluid Number"
            value={fluidNumber}
            onChange={(e) => setFluidNumber(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500"
          />
          <input type="number" placeholder='Enter Drop Factor'
          value={dropFactor}
           onChange={(e)=>setDropFactor(e.target.value)}
           className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className='flex flex-row mt-6 w-full h-16  items-center justify-between'>
          <h2 className='w-52'>Custom Alarm Percentage</h2>
          <div className='flex flex-row space-x-1 w-2/4 items-center'>
          <span>{customAlarmPercentage}%</span>
          <InputSlider
            axis="x"
            x={customAlarmPercentage}
            onChange={({ x }) => setCustomAlarmPercentage(x)}
            styles={{
              track: {
                width: '100%',
                height: 4,
                backgroundColor: '#ccc',
              },
              active: {
                backgroundColor: '#007bff',
              },
              thumb: {
                width: 20,
                height: 20,
                backgroundColor: '#007bff',
              },
            }}
          />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 self-center ml-96 bg-indigo-500 text-white px-8 py-2 rounded-sm hover:bg-indigo-600"
        >
          Add Patient
        </button>
      </form>
      <Toaster />
    </div>
  );
};

export default Home;
