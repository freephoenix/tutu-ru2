import React, { useState, useEffect } from 'react';
import './App.css';

//links to data to be uploaded
const 
      dataLittle = 'http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&adress={addressObject}&description={lorem|32}',
      dataBig = 'http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&adress={addressObject}&description={lorem|32}';

function App() {
  const
        [resievedData, setResievedData] = useState([]),//storage of uploaded data
        [filteredData, setFilteredData] = useState([]),//storage of data filtered by user
        [index, setIndex] = useState(0),//index of current page
        [showMore, setShowMore] = useState(false),//clicking a cell of the table changes it on "true" and opens additional info
        [selectedPersonCard, setSelectedPersonCard] = useState({}),//pearson card selected by user by clicking on a cell
        [isLoadingDataInProgress, setIsLoadingDataInProgress] = useState(false),//"true" while data is loading
        [loadingDataErrorMessage, setLoadingDataErrorMessage ] = useState(''),//to show Error message in data can't be loaded
        linesPerPage = 50,
        filteredDataLength = filteredData.length;
  let
        rearrangedData = [],//filtered data splitted by pages
        filteredDataForOnePage = [],//rearrangedData for current page
        prevAbortController,//stores data to abort loading one amount of data if user started loading another amount of data
        delayedChangeTimeOutId;//stores data to restart timer bofere changes in search field will be counted

  //fill the variables
  for(let i=0; i<filteredDataLength; i+=linesPerPage) rearrangedData.push(filteredData.slice(i, i+linesPerPage));
  filteredDataForOnePage = rearrangedData[index];

  const rearrangedDataLength = rearrangedData.length;

  //set title of the page
  useEffect(() => {
    document.title = 'tutu-ru';
  }, []);

  function handlePrevClick() {
    if(0 < index) setIndex(index - 1);//if current page is the first one, show the last page
    else setIndex(rearrangedDataLength - 1);
  }

  function handleNextClick() {//if current page is the last one, show the first page
    if(index < rearrangedDataLength - 1) setIndex(index + 1);
    else setIndex(0);
  }

  //if user clicks a cell of the table, then corresponding pearson's additional information displays
  function handleMoreInfoClick(e) {
    setSelectedPersonCard(filteredData.find(x=>x.localId===e.target.parentNode.attributes["name"].value));
    setShowMore(true);
  }

  //if user clicks a cell of the table header, then rows become sorted/reversed corresponding the title of the cell
  function handleTableTitleClick(e) {
    const 
          string = e.target.innerHTML,
          [value, arrow] = string.split(' ');
    if(arrow === '▲') {
      e.target.innerHTML = value + ' ▼';
      setFilteredData([...filteredData.sort((a,b)=>{
        if(a[value] > b[value]) return 1;
        else if(a[value] < b[value]) return -1;
        return 0;
      })]);
    } else {
      e.target.innerHTML = value + ' ▲';
      setFilteredData([...filteredData.sort((a,b)=>{
        if(b[value] > a[value]) return 1;
        else if(b[value] < a[value]) return -1;
        return 0;
      })]);
    }
  }

  //if user clicks a button to upload data
  function handleUploadData(isBig) {
    prevAbortController?.abort();//if data is already uploading, stop it
    const abortController = new AbortController();//store information for next possible aborting
    const dataToLoad = isBig ? dataBig : dataLittle;
    setIsLoadingDataInProgress(true);//show loading icon
    setLoadingDataErrorMessage('');//clear error message
    setResievedData([]);//clear storages of data
    setFilteredData([]);
    
    fetch(dataToLoad, { signal: abortController.signal, })
      .then(res => res.json())
      .then(data => {
        data.sort((a,b)=>a.id-b.id).forEach((x, i)=>x.localId = ''+i+'.'+x.id);
        setResievedData(data);
        setFilteredData(data);
        setIsLoadingDataInProgress(false);//remove loading icon
      })
      .catch((err) => {
        setIsLoadingDataInProgress(false);//remove loading icon
        setLoadingDataErrorMessage('Data loading error: '+err.message);//show error message
      });
    ;
  };

  function handleFilter(e) {
    if(delayedChangeTimeOutId) clearTimeout(delayedChangeTimeOutId);//clears timeout with every click
    const value = e.target.value;
    delayedChangeTimeOutId = setTimeout(()=>{
      setFilteredData(resievedData.filter(personCard=>{//restarts timeout with every click
        return JSON.stringify(personCard).indexOf(value) !== -1;//filter data that has value entered by user
      }));
    }
    , 500);
  }

  return (<div className="px-2">
    <div className="text-center">
      <h1>Data uploader & sorter</h1>
      <button aria-label="upload-big-data-button" className="btn border mx-1" onClick={()=>{
        prevAbortController = handleUploadData(true);
      }}>upload big data</button>
      <button aria-label="upload-small-data-button" className="btn border mx-1" onClick={()=>{
        prevAbortController = handleUploadData(false);
      }}>upload small data</button>
    </div>

    {isLoadingDataInProgress && <div className="position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border text-primary text-center" role="status"></div>
    </div>}
    {loadingDataErrorMessage && <div>
      {loadingDataErrorMessage}
    </div>}
    {resievedData.length>0 && <div className="row col-md-6 offset-md-3">
      <div className="input-group">
        <input type="text" className="form-control" placeholder="Type to filter the data" onChange={handleFilter} role="search"/>
        <span className="input-group-text">&#128269;</span>
      </div>
    </div>}
    {filteredDataForOnePage!==undefined && <div>
      {filteredDataLength > linesPerPage && <div className="row col-md-4 offset-md-4 input-group">
        <button aria-label="table-header-prev-button" className="col-1 btn border input-group-btn" onClick={handlePrevClick}>◄ Prev</button>
        <span className="col-2 input-group-text justify-content-center">{index+1}</span>
        <button aria-label="table-header-next-button" className="col-1 btn border input-group-btn" onClick={handleNextClick}>Next ►</button>
      </div>}
      <div className="col-md-6 offset-md-3">
        <table className="table table-striped table-bordered table-hover table-sm">
          <thead>
            <tr key='tableTitle' onClick={handleTableTitleClick}>
              <th className="col-1 border text-center" role="columnheader" style={{fontSize: '1vw'}}>id ▼</th>
              <th className="col-1 border text-center" role="columnheader" style={{fontSize: '1vw'}}>firstName ▼</th>
              <th className="col-1 border text-center" role="columnheader" style={{fontSize: '1vw'}}>lastName ▼</th>
              <th className="col-2 border text-center" role="columnheader" style={{fontSize: '1vw'}}>email ▼</th>
              <th className="col-2 border text-center" role="columnheader" style={{fontSize: '1vw'}}>phone ▼</th>
            </tr>
          </thead>
          <tbody>
            {filteredDataForOnePage.map((personCard) => {
              return (
                <tr key={personCard.localId} name={personCard.localId} onClick={handleMoreInfoClick}>
                  <td className="col-1 border text-center" role="cell" style={{fontSize: '1vw'}} name='id'>{personCard.id}</td>
                  <td className="col-1 border text-center" role="cell" style={{fontSize: '1vw'}} name='firstName'>{personCard.firstName}</td>
                  <td className="col-1 border text-center" role="cell" style={{fontSize: '1vw'}} name='lastName'>{personCard.lastName}</td>
                  <td className="col-2 border text-center" role="cell" style={{fontSize: '1vw'}} name='email'>{personCard.email}</td>
                  <td className="col-2 border text-center" role="cell" style={{fontSize: '1vw'}} name='phone'>{personCard.phone}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredDataLength > linesPerPage && <div className="row col-md-4 offset-md-4 input-group">
        <button aria-label="table-footer-prev-button" className="col-1 btn border input-group-btn" onClick={handlePrevClick}>◄ Prev</button>
        <span className="col-2 input-group-text justify-content-center">{index+1}</span>
        <button aria-label="table-footer-next-button" className="col-1 btn border input-group-btn" onClick={handleNextClick}>Next ►</button>
      </div>}
      {showMore && <div>
        Выбран пользователь <b>{selectedPersonCard.firstName+' '+selectedPersonCard.lastName}</b><br/>
        Описание:<br/>
        <textarea defaultValue={selectedPersonCard.description}></textarea><br/>
        Адрес проживания: <b>{selectedPersonCard.adress.streetAddress}</b><br/>
        Город: <b>{selectedPersonCard.adress.city}</b><br/>
        Провинция/штат: <b>{selectedPersonCard.adress.state}</b><br/>
        Индекс: <b>{selectedPersonCard.adress.zip}</b><br/>
      </div>}
    </div>}
  </div>);
}

export default App;
