let essentials = null, locations = null, info={};
let markerShapeStyle = {color: 'green', fillColor: '#f03', fillOpacity: 0.5, radius: 40000}

// creating map
const MAP = L.map('map').setView([21.17,79.09], 5);

// making tiles using openstreet map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })
            .addTo(MAP);

const getTemplateHTML = (arr) =>{
    let groups = _.groupBy(arr, 'category');
    // console.log(groups);
    let template = "<table>"
    for(let key in groups){
        let group = groups[key];
        template+=`<tr><th class='th-content' rowspan='${group.length+1}'>${key}</th></tr>`;
        for(let item of group){
            template+=`<tr>
                        <td class='td-content'>
                            <strong>${item.nameoftheorganisation},</strong>
                            <span>${item.city}, ${item.state}</span>
                            <br>
                            <div>Phone: ${item.phonenumber}</div>
                            <div>Web: <a href='${item.contact}' target='_blank'>${item.contact}</a></div>
                            <br>
                            <div>${item.descriptionandorserviceprovided}</div>
                        </td>
                    </tr>`;
        }
    }
    template+="</table>";
    return template;
}

const data = async() =>{

    // get cities in India with lat lng
    let locationAPI = await fetch('./js/in.json');
    locations = await locationAPI.json();

    locations = _.chain(locations)
                    .map(e=>_.pick(e,'city','lat','lng'))
                    .reduce((acc,v)=>{
                        acc[v['city'].toLowerCase()]=L.latLng(v.lat, v.lng);
                        return acc;
                    },{})
                    .value();

    // get essentials resources data
    let essentialsAPI = await fetch('https://api.covid19india.org/resources/resources.json');
    essentials = await essentialsAPI.json();
    essentials = essentials.resources;

    essentials = _.chain(essentials)
                  .map(e=>{
                      let loc = e.city.toLowerCase();
                      if(locations[loc] && locations[loc]!=null){
                          if(info[loc] && info[loc]!=null){
                              info[loc]['essentials'].push(e);
                          }else{
                            info[loc] = {
                                location: locations[loc],
                                essentials:[e]
                            }
                          }
                      }
                  });

    
    for (let loc in info){
        L.circle(info[loc].location, markerShapeStyle)
         .bindPopup(loc)
         .on('click',()=>{
             document.getElementById("info").innerHTML=getTemplateHTML(info[loc].essentials);
             window.location.href='#info';
            })
         .addTo(MAP);
    }
}

data();