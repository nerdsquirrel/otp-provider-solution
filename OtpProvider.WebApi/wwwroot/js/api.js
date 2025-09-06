function apiRequest(url, method, data, callback, errorCallback) {
    $.ajax({
        url: url,
        method: method,
        contentType: "application/json",
        data: data ? JSON.stringify(data) : null,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: callback,
        error: errorCallback
    });
}
