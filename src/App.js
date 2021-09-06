import { useEffect, useState } from 'react';
import './App.css';
import { api } from './axios-api';

function App() {
  const currs = ["USD", "EUR", "AUD", "CAD", "CHF", "NZD", "BGN"];

  const [allCurrencies, setAllCurrencies] = useState([]);
  const [selectedCurr, setSelectedCurr] = useState("usd");
  const [currencies, setCurrencies] = useState([]);
  const [groupOne, setGroupOne] = useState([]);
  const [groupTwo, setGroupTwo] = useState([]);
  const [groupThree, setGroupThree] = useState([]);
  const [longestCount, setLongestCount] = useState(-1);

  const setState = (currArr, curr = null) => {
    
    setAllCurrencies(currArr);
    const selectedArr = currArr.filter(c => c.name.includes(curr ? curr : selectedCurr));
    setCurrencies(selectedArr);
    setGroupOne(selectedArr.filter(c => c.value < 1));
    setGroupTwo(selectedArr.filter(c =>  c.value >= 1 && c.value < 1.5));
    setGroupThree(selectedArr.filter(c => c.value >= 1.5));
    setLongestCount(findLongest(selectedArr));
  }

  const findLongest = (arr) => {
    let max = 1;
    let count = 1;
    let startIdx = 0;
    let idx = 1;
    for (let i = 0; i < arr.length-1; i++) {
      if (Math.abs(arr[i].value - arr[i+1].value) <= 0.5) {
        if (Math.abs(arr[startIdx].value - arr[i+1].value) <= 0.5) {
          count++;
        } else {
          if (max < count) {
            max = count;            
          } 
          count = 1;
          startIdx = idx;
          i = idx++;          
        }
      } else {
          count = 1;
          startIdx = idx;
          i = idx++;
      }
    }
    return max;
  }

  const fetchData = async () => {
    const transformedArr = [];
    const arr = []; 
    // create a set with every possible combination
    currs.forEach((c,i) => {
      currs.forEach((c2,j) => {
        if(i !== j) {          
          transformedArr.push(`${c.toLowerCase()}/${c2.toLowerCase()}.json`);
          arr.push({name: `${c.toLowerCase()}-${c2.toLowerCase()}`});
        }
      })
    });
    const res = await api.getAllRates(transformedArr);
    
    localStorage.setItem("cached", 1);
    localStorage.setItem("date", Date.now());
    const mappedRes = res.map(r => r.data);
    const stateArr = arr.map((r,i) => {
      // state will be [{name:"usd-eur", value: 0.84}, {...},...]
      return {...r, value: mappedRes[i][r.name.slice(-3)].toFixed(2)};
    }).sort((a,b) => a.value - b.value);
    
    localStorage.setItem("currencies", JSON.stringify(stateArr));
    setState(stateArr);
  }

  const loadData = () => {
    if(!localStorage.getItem("cached")) {
      fetchData();
    }
    const currs = JSON.parse(localStorage.getItem("currencies"));
    setState(currs);
  };
  
  useEffect(() => {
      const isCached = !!parseInt(localStorage.getItem("cached"));
      const date = Number(localStorage.getItem("date"));
      // if no date no cached info or if 24h have passed since last fetch
      if (!isCached || !date || (Date.now() - date) > (1000 * 60 * 60 * 24)) {
        console.log('getting data');
        fetchData();
      } else {
        loadData();
      }
  },[]);

  const getCurrencies = (e) => {
    const text = e.target.options[e.target.selectedIndex].text.toLowerCase();
    setSelectedCurr(text);
    setState(allCurrencies, text);
  };

  return (
    <div className="App">
      <div className="heading padding">
        <h3>Please select a currency</h3>
        <select name="currencies" id="currencies" onChange={getCurrencies}>
          {currs && currs.map( (c,i) => <option value={c} key={i}>{c}</option>)}
        </select>
      </div>
      <p className="padding">Selected currency rates: </p>
      <ul className="groups padding">
      <div className="group">      
        <p>Group 1</p>
        {groupOne.map((c,i) => <li key={i}><b>{c.name.toUpperCase()}:</b> {c.value}</li>)}
        <p>Count: {groupOne.length}</p>
      </div>
      <div className="group">
      <p>Group 2</p>
        {groupTwo.map((c,i) => <li key={i}><b>{c.name.toUpperCase()}:</b> {c.value}</li>)}
        <p>Count: {groupTwo.length}</p>
      </div>
      <div className="group">
        <p>Group 3</p>
        {groupThree.map((c,i) => <li key={i}><b>{c.name.toUpperCase()}:</b> {c.value}</li>)}
        <p>Count: {groupThree.length}</p>
      </div>
      </ul>
      <h4 className="padding">Longest count: {longestCount}</h4>
    </div>
  );
}

export default App;
