module.exports = {
    siteMetadata: {
      title: "testing out alternative xml parser",
    },
    plugins: [
      //`gatsby-transformer-xml`,
       {
        resolve:"gatsby-transformer-xml-alternative",
        
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `xmlContent`,
          path: `${__dirname}/content`,
        },
      },
    ],
  }