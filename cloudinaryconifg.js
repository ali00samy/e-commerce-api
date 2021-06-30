const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name : 'dd8viccdc',
    api_key : '636674964212661',
    api_secret: 'LTZJSw5AtEH-cWRUKcl2xNLHQbI'
})

exports.uploads = (file) =>{
    return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) =>{
    resolve({url: result.url, id: result.public_id})
    }, {resource_type: "auto"})
    })
}