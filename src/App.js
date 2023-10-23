
// Importing modules
import React, { useState, useEffect } from "react";
import AudioRecorder from "./components/AudioRecorder";

import "./App.css";

function App() {
 
	const [data, setdata] = useState([]);
  
	useEffect(() => {

		fetch("/data").then((res) =>
			res.json().then((data) => {

				setdata(
        
        {
          redactedText: data.body
        }
        // {
        //   transcriptedText: data.text
        // }
			
				);
			})
		);
	}, []);

	return (
		<div className="App">
			<header className="App-header">

        <h1>Customer Support </h1>
        <AudioRecorder/>
    <h3>Transcripted text is: </h3>
   
    
    <p>{data.redactedText}</p>

			</header>
		</div>
	);
}

export default App;


