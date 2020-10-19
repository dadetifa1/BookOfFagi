
const tomtom_api_key = '0xVg5XbquOyUB0Cf3ATRQrKd9W7IGSCX';
const tomtom_url = 'https://api.tomtom.com/search/2/search/';

const zomato_collection_url = 'https://developers.zomato.com/api/v2.1/collections'
const zomato_location_url = 'https://developers.zomato.com/api/v2.1/locations'
const zomato_apiKey = '330aeb91e96aa95799c484c0ee8f081c';

function loadCollectionlinksClicked(){
    $('#results').on('click', '.collection-links', function(event) {
        alert('we in here baby');
    });
}

function SearchForLocationClicked(){
    $('form').submit(event => {
        event.preventDefault();
        $('.card').remove();
        const searchTerm = $('#js-search-term').val();
        getLatLon(searchTerm);
    });
}

function getLatLon(location){
    const params = {
        countrySet: 'USA',
        key: tomtom_api_key
    };
    let encodedLocation = encodeURIComponent(location);
    const queryString = formatQueryParams(params);
    const url = `${tomtom_url} ${encodedLocation} .json? ${queryString}`;

    fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return GetZomatoCityData(responseJson,encodedLocation);
    })
    .catch(err => {
        alert(err.message);
    });

    
}

function GetZomatoCityData(data, encodedSearchLocation){
    
    const params = {
        query: encodedSearchLocation,
        lat: data.results[0].position.lat,
        lon: data.results[0].position.lon
    };

    const queryString = formatQueryParams(params);
    const url = `${zomato_location_url}?${queryString}`

    const options = {
        headers: new Headers({
          "user-key": zomato_apiKey})
    };
    
    fetch(url, options)
    .then(response => response.json())
    .then(responseJson => GetZomatoCollectionData(responseJson.location_suggestions[0].city_id
        , responseJson.location_suggestions[0].title
        , responseJson.location_suggestions[0].entity_id))
}

function GetZomatoCollectionData(cityId, cityTitle, entityId){
    console.log(entityId);
    const params = {
        city_id: cityId
    };

    const queryString = formatQueryParams(params);

    const url = `${zomato_collection_url}?${queryString}`
    console.log(url);

    const options = {
        headers: new Headers({
          "user-key": zomato_apiKey})
    };
    
    fetch(url, options)
    .then(response => response.json())
    .then(responseJson => displayCollections(responseJson, cityTitle, entityId))

}

function displayCollections(data, cityTitle , entityId){
    let htmldata = "";
    data.collections.forEach( collections => {
        htmldata += `<div class="card" data-entityid="${entityId}" data-collectionid="${collections.collection.collection_id}">
        <img src="${collections.collection.image_url}" alt="Avatar" style="width:100%">
        <div class="container">
          <h4><a class="collection-links" href="${collections.collection.share_url}"><b>${collections.collection.title}</b></a></h4>
          <p>${collections.collection.description}</p>
        </div>
      </div>`;

    });
    $('#search-term').text(cityTitle);
    $('#results').append(htmldata);
    $('#results').removeClass('hidden');

}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
  
    return queryItems.join('&');
}

function loadApp(){
    SearchForLocationClicked();
}

$(loadApp);