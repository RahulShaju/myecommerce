const mongoose= require('mongoose')

const categorySchema = mongoose.Schema({ 

  categoryname: {
    type: String,
  },
  gendercategory: {
    type: String,
    required: true,
  },
  brandcategory: {
    type: String,
  }
});

module.exports=mongoose.model("Category", categorySchema);
