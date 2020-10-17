
Tomtom_api_key = '0xVg5XbquOyUB0Cf3ATRQrKd9W7IGSCX';


function loadApp(){
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        alert(searchTerm);
    });
}

$(loadApp);