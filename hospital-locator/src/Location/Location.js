import React from 'react'
const GOOGLE_API_KEY = require('../apiKeys')
const GEOCODE_API = "https://maps.googleapis.com/maps/api/geocode/json?"
const PLACES_API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
const PLACES_RADIUS=100

const getCityFromCoordinates = (coordinates) => {
    return new Promise((resolve, reject) => {
        fetch(`${GEOCODE_API}latlng=${coordinates}&result_type=locality&key=${GOOGLE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.status == "OK" && data.results.length > 0 && data.results[0].address_components.length > 0) {
                resolve(data.results[0].address_components[0].long_name)
            } else {
                reject(data.status)
            }
        })
        .catch(reject)
    })
}

const usePermission = (permission) => {
    const [state, setState] = React.useState()
    const requestPermission = () => setState(undefined)
    const permissionsAvailable = !navigator || !navigator.permissions || !navigator.permissions.query

    React.useEffect(() => {
        if (state) {
            return
        }

        if (permissionsAvailable) {
            console.log('Permissions API not found')
            return
        }

        navigator.permissions.query({name: permission}).then(result => {
            console.log('Updated permission: ', result)
            result.onchange = () => setState(result)
            setState(result)
        })
    }, [state, permission, permissionsAvailable])

    return [state, requestPermission, permissionsAvailable]
}

const useLocation = (enableHighAccuracy = true, timeout = 5000, maximumAge = 0) => {
    const [coordinates, setCoordinates] = React.useState()
    const [error, setError] = React.useState()

    React.useEffect(() => {
        const id = navigator.geolocation.watchPosition((pos) => {
            setError(undefined)
            setCoordinates(pos.coords)
        }, (err) => {
            console.warn('Unable to watch current position', err)
            setError(err)
        }, {
            enableHighAccuracy: enableHighAccuracy,
            timeout: timeout,
            maximumAge: maximumAge
        })

        return () => navigator.geolocation.clearWatch(id)
    }, [enableHighAccuracy, timeout, maximumAge])

    return [coordinates, error]
}

//getNearByHospitalsFromLocation(`28.704060,77.102493`)
const getNearByHospitalsFromLocation = (coordinates) => {
    return new Promise((resolve, reject) => {
        const api = `${PLACES_API}location=${coordinates}&radius=100&type=hospital&key=${GOOGLE_API_KEY}`
        console.log(api)
        fetch(api, {
            mode: 'no-cors'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.status == "OK" && data.results.length > 0 && data.results[0].address_components.length > 0) {
                resolve(data.results[0].address_components[0].long_name)
            } else {
                reject(data.status)
            }
        })
        .catch(reject)
    })
   // return data
}

export { usePermission, useLocation, getCityFromCoordinates, getNearByHospitalsFromLocation }