module.exports = {

    scrobbleParams: [
        {
            param_key: 'artist',
            required: true,
            type: 'string',
            validator_functions: [(param) => { return param.length > 0 }]
        },
        {
            param_key: 'track',
            required: true,
            type: 'string',
            validator_functions: [(param) => { return param.length > 0 }]
        },
        {
            param_key: 'timestamp',
            required: true,
            type: 'number',
            validator_functions: [(param) => { return param > 0 }]
        },
        {
            param_key: 'album',
            required: false,
            type: 'string',
            validator_functions: [(param) => { return param.length > 0 }]
        },
        {
            param_key: 'albumArtist',
            required: false,
            type: 'string',
            validator_functions: [(param) => { return param.length > 0 }]
        },
        {
            param_key: 'duration',
            required: false,
            type: 'number',
            validator_functions: []
        },
    ]

}