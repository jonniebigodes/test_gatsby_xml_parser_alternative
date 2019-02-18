var convert = require(`xml-js`)
const _ = require(`lodash`)

exports.onCreateNode = async ({ node, actions, loadNodeContent, createNodeId, createContentDigest }) => {
    if (![`application/xml`, `text/xml`].includes(node.internal.mediaType)) {
        return
    }

    //gatsby apis calls
    const { createNode, createParentChildLink } = actions
    const localXML = await loadNodeContent(node)
    //
    //variable to contain final node array
    let xmlnodeArray = []
    //

    // variable to contain the parsed xml result
    const result = convert.xml2js(localXML, {
        compact: true,
        spaces: 4,
        trim: true,
        nativeType: true,
        ignoreDeclaration: true,
        ignoreComment: true,
    })
    // variable to contain the same object as original plugin
    const transformedObject = {
        root: {
            name: ``,
            attributes: {},
            children: [],
        },
    }

    // iteration of key/value pairs at top level
    Object.entries(result).forEach(([key, value]) => {
        transformedObject.root.name = key
        transformedObject.root.attributes = result[key]._attributes ? result[key]._attributes : {}
        
        // iteration of the key/value pairs one level deep (2rd level down the rabbit hole)
        Object.entries(result[key]).forEach(([childkey, childvalue]) => {
            
            if (Array.isArray(childvalue)) {
                transformedObject.root.children = [...transformedObject.root.children, { name: childkey, children: childvalue }]
            } else {

                // iteration of the key/value pairs one level deep (3rd level down the rabbit hole)
                Object.entries(childvalue).forEach(([gckey, gvvalue]) => {
                    if (Array.isArray(gvvalue)) {
                        transformedObject.root.children = [
                            ...transformedObject.root.children,
                            { name: gckey, children: gvvalue },
                        ]
                    }
                })
            }
        })
    })
    
    // destructure the children from the object 
    const { root: { children } = [] } = transformedObject
    // iterates the children from the object (2nd level down the rabbit hole)
    children.forEach(element => {
        // iterates the granchildren from the object (3nd level down the rabbit hole)
        // and adds the contents to the node array so that the nodes can be converted into gql nodes 
        element.children.forEach((child, i) => {
           
            xmlnodeArray = [
                ...xmlnodeArray,
                {
                    ...child,
                    id:_.get(child,'_attributes.id')!==undefined ? child._attributes.id : createNodeId(`${node.id} [${i}] >>> XML`),
                    parent: node.id,
                    children: [],
                    internal: {
                        contentDigest: createContentDigest(child),
                        type: _.upperFirst(_.camelCase(`${node.name} xml`)),
                    },
                },
            ]
        })
    })
    // creates the nodes
    xmlnodeArray.forEach(element=>{
        createNode(element)
        createParentChildLink({parent:node,child:element})
    })
    return
}
