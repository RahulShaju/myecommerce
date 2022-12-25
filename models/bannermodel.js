const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
  bimage: {
    type: String,
    required: true,
  },
  btitle: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model("Banner",bannerSchema)
