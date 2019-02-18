const path= require(`path`);


exports.createPages=({actions})=>{
    const {createPage}= actions
    const parsedXmlTemplate= path.resolve(`./src/templates/parsed-xml-template.js`)
}