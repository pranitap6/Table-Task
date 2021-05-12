let table = document.querySelector('.myTable');
let wrap = document.querySelector('.button-wrapper');
let status = document.querySelector('#status');
const modal = document.querySelector('.modal');
const content = document.querySelector('.modal-content');
const close = document.querySelector('.close');
let wrapper = document.querySelector('.modal-wrapper');
let A;
async function FindData(){
  const data = await fetch('https://api.spacexdata.com/v3/launches/');
  const response = await data.json();
  return response;
} 
document.addEventListener('DOMContentLoaded',() =>{
  let val = JSON.parse(localStorage.getItem('persist'));
  console.log(val.filterstate);
  status.value = val.filterstate;
  let persistData = val.data;
  makeFilter(persistData);
});
FindData().then(res =>{
  let state = {
    'queryData': res,
    'page': 1,
    'row': 10
  }
  wrap.addEventListener('click',function(e){
    table.innerHTML = ``;
    let page = e.target.value;
    state.page = page;
    buildTable(state);
  })
  status.addEventListener('change',function(e){
    let state2 = state;
    let filtqueryData =[];
    let filter = e.target.value;
    if(filter === 'no'){
      filtqueryData = state2.queryData;
    }else{
      if(filter === 'success'){
        filtqueryData = state2.queryData.filter((item)=>{
            return item.launch_success === true;
        });
      }else if(filter === 'failed'){
        filtqueryData = state2.queryData.filter((item)=>{
          return item.launch_success === false;
        });
      }else if(filter === 'upcoming'){
        filtqueryData = state2.queryData.filter((item) =>{
          return item.upcoming === true;
        })
      }
    }
    let persist ={
      filterstate : filter,
      data: filtqueryData
    }
    if(JSON.parse(localStorage.getItem('persist')) !== null){ 
      localStorage.clear();
    }
    localStorage.setItem('persist',JSON.stringify(persist));
    makeFilter(filtqueryData);
    
  });
  if(localStorage.getItem('persist') === null){
    buildTable(state);
  }
   // buildTable(state)
});

function pagination(queryData,page,row){
  let trimStart = (page-1) * row;
  let trimEnd = trimStart + row;
  let trimData = queryData.slice(trimStart,trimEnd);
  let pages = Math.ceil(queryData.length/row);

  return{
    'queryData': trimData,
    'pages': pages
  }
}
function buildModal(list){
  let data = list[0];
  let span = data.upcoming;
  if(!span){
    span = data.launch_success;
    if(span){
      span = "success"; 
    }else{
      span = "failed";  
    }
  }else{
      span = "upcoming";
  }
  let date = data.launch_date_unix;
   date = date * 1000;
   const newDate = new Date(date);
   const finalDate = newDate.toDateString();
   let header = `<header>
                    <div><h1>${data.mission_name}</h1><span>${span}</span></div>
                    <p>${data.rocket.rocket_name}</p>
                    <p>${data.details}</p>
                </header>`
  wrapper.innerHTML +=  header;           
   let row = `<tr>
                <td>Flight Number</td>
                <td>${data.flight_number}</td>
              </tr>
            <tr>
              <td>Mission Name</td>
              <td>${data.mission_name}</td>
            </tr>
            <tr>
              <td>Rocket Type</td>
              <td>${data.rocket.rocket_type}</td>
            </tr> 
            <tr>
              <td>Rocket Name</td>
              <td>${data.rocket.rocket_name}</td>
            </tr> 
            <tr>
              <td>Manufacturer</td>
              <td>${data.rocket.second_stage.payloads[0].manufacturer}</td>
            </tr> 
            <tr>
              <td>Nationality</td>
              <td>${data.rocket.second_stage.payloads[0].nationality}</td>
            </tr> 
            <tr>
              <td>Launch Date</td>
              <td>${finalDate}</td>
            </tr> 
            <tr>
              <td>Payload Type</td>
              <td>${data.rocket.second_stage.payloads[0].payload_type}</td>
            </tr> 
            <tr>
              <td>Orbit</td>
              <td>${data.rocket.second_stage.payloads[0].orbit}</td>
            </tr> 
            <tr>
              <td>Launch Site</td>
              <td>${data.launch_site.site_name}</td>
            </tr>`
      wrapper.innerHTML += row;    
}
function buttonCreate(pages){
  wrap.innerHTML = ``;
  for(let i = 1;i<=pages;i++){
    wrap.innerHTML += `<button value=${i} class="page btn" >${i}</button>`;
  }
}
function makeFilter(data){

  let state3 ={
    queryData : data,
    'page': 1,
    'row': 10
  }
  table.innerHTML = ``;
  buildTable(state3);
}

function buildTable(state){
  let data = pagination(state.queryData,state.page,state.row);
  let list = data.queryData;
  let modalList = data.queryData;
  for(let i = 0;i<list.length;i++){
    let status = list[i].upcoming;
    if(!status){
      status = list[i].launch_success;
      if(status){
        status = "success";
      }else{
        status = "failed";
      }
    }else{
      status = "upcoming";
    }
    let row = `<tr class=${list[i].flight_number}>
                  <td>${list[i].flight_number}</td>
                  <td>${list[i].launch_date_utc}</td>
                  <td>${list[i].launch_site.site_name}</td>
                  <td>${list[i].mission_name}</td>
                  <td>${list[i].rocket.second_stage.payloads[0].orbit}</td>
                  <td>${status}</td>
                  <td>${list[i].rocket.rocket_name}</td>
              </tr>`;        
    table.innerHTML += row;
  }
  buttonCreate(data.pages);
  let rows = document.querySelectorAll('tr');
  rows.forEach((item) =>{
    item.addEventListener('click',(e) =>{
      modal.classList.add('show');
      let val = Number(e.target.parentNode.className);
      let modalArr = modalList.filter((item) =>{
        return item.flight_number === val;
      })
      wrapper.innerHTML = ``;
      buildModal(modalArr);
    })
  })
}
close.addEventListener('click',() =>{
  modal.classList.remove('show');
})
