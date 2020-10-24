
const tomtom_api_key = '0xVg5XbquOyUB0Cf3ATRQrKd9W7IGSCX';
const tomtom_url = 'https://api.tomtom.com/search/2/search/';

const zomato_collection_url = 'https://developers.zomato.com/api/v2.1/collections'
const zomato_location_url = 'https://developers.zomato.com/api/v2.1/locations'
const zomato_search_url = 'https://developers.zomato.com/api/v2.1/search';
const zomato_apiKey = '330aeb91e96aa95799c484c0ee8f081c';
let global_lat = '';
let global_lon = '';
let global_collectionId = 0;
let images = ['images/image1.jpg', 'images/image2.jpg', 'images/image3.jpg', 'images/image4.jpg', 'images/image5.jpg'];


function displayCollections(data, cityTitle , entityId){
    let htmldata = "";
    
    data.collections.forEach( collections => {
        htmldata += `
        <li class="cards__item">
            <div class="card" data-entityid="${entityId}" 
            data-collectionid="${collections.collection.collection_id}" 
            data-collectionName="${collections.collection.title}">
                <img src="${collections.collection.image_url}" alt="Avatar" class="card__image">
                <div class="card__content">
                <div class="card__title"><a class="collection-links" href="${collections.collection.share_url}"><b>${collections.collection.title}</b></a></div>
                    <p class="card__text">${collections.collection.description}</p>
                </div>
            </div>
        </li>
        `;

    });
    $('#search-term').text(`Search results for -  ${cityTitle}`);
    $('#results-out').append(htmldata);
    $('#results').removeClass('hidden');

}

function displaySelectedCollection(data, collectionName){
    let htmldata = "";
    data.restaurants.forEach( restaurants => {
        htmldata += `
        <li class="cards__item">
            <div class="card">
                <a id="back-to-collection" href="#" 
                data-back-collectionid="${global_collectionId}" 
                data-back-entityid="${restaurants.restaurant.location.city_id}" 
                data-back-searchTitle="${restaurants.restaurant.location.city}"> Back to search results</a>
                <img src="${restaurants.restaurant.featured_image === "" ? images[Math.floor(Math.random() * images.length)]: restaurants.restaurant.featured_image}" alt="restaurant" class="card__image">
                <div class="card__content">
                    <div class="card__title"><a href="${restaurants.restaurant.url}" target="_blank"><b>${restaurants.restaurant.name}</b></a></div>
                    <p class="card__text">
                        User rating - ${restaurants.restaurant.user_rating.rating_text} <br>
                        ${restaurants.restaurant.phone_numbers} <br>
                        ${restaurants.restaurant.location.address}
                    </p>
                </div>
            </div>  
        </li>
      `;

    });
    $('#search-term').text(collectionName);
    $('#results-out').append(htmldata);
}

function getZomatoCollectionData(entityID, collectionId, collectionName){
    const params = {
        entity_id: entityID,
        lat: global_lat,
        lon: global_lon,
        collection_id: collectionId
    };

    global_collectionId = collectionId;

    const queryString = formatQueryParams(params);
    const url = `${zomato_search_url}?${queryString}`

    const options = {
        headers: new Headers({
          "user-key": zomato_apiKey})
    };

    fetch(url, options)
    .then(response => response.json())
    .then(responseJson => displaySelectedCollection(responseJson, collectionName))
    .catch(err => alert(err.message));
}

function GetZomatoCityData(data, encodedSearchLocation){
    global_lat = data.results[0].position.lat;
    global_lon = data.results[0].position.lon;

    const params = {
        query: encodedSearchLocation,
        lat: global_lat,
        lon: global_lon
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
    .catch(err => alert(err.message));
}

function GetZomatoCollectionData(cityId, cityTitle, entityId){
    const params = {
        city_id: cityId
    };

    const queryString = formatQueryParams(params);

    const url = `${zomato_collection_url}?${queryString}`

    const options = {
        headers: new Headers({
          "user-key": zomato_apiKey})
    };
    
    fetch(url, options)
    .then(response => response.json())
    .then(responseJson => displayCollections(responseJson, cityTitle, entityId))
    .catch(err => {
        alert(err.message);
    });
}

function getTomtomLatLon(location){
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

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
  
    return queryItems.join('&');
}

function BacktoCollectionslinkClicked(){
    $('#results').on('click', '#back-to-collection', function(event) {
        event.preventDefault();
        $('.cards').html('');
        let entityid = $(this).attr('data-back-entityid');
        let collectionid = $(this).attr('data-back-collectionid');
        let collectionName = $(this).attr('data-back-searchTitle');
        GetZomatoCollectionData(entityid, collectionName, collectionid);
        
    });
}

function loadCollectionlinksClicked(){
    $('#results').on('click', '.collection-links', function(event) {
        event.preventDefault();
        $('.cards').html('');
        let entityid = $(this).closest('.card').attr('data-entityid');
        let collectionid = $(this).closest('.card').attr('data-collectionid');
        let collectionName = $(this).closest('.card').attr('data-collectionName');
        getZomatoCollectionData(entityid, collectionid, collectionName)
    });
}

function searchForLocationClicked(){
    $('form').submit(event => {
        event.preventDefault();
        $('.cards').html('');
        let numbers = /^[0-9]+$/;
        const searchTerm = $('#js-search-term').val();

        if(numbers.test(searchTerm))
        {
            alert('Please enter only valid city and/or city, state');
            $('#js-search-term').val('');
            return;
        }
            
        getTomtomLatLon(searchTerm);
        $('#js-search-term').val('');
    });
}

function loadApp(){
    searchForLocationClicked();
    loadCollectionlinksClicked();
    BacktoCollectionslinkClicked()
}

$(loadApp);