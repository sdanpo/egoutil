
function evaluateTemplate_getField(theData, ident) {
    for ( var i = 0; i < ident.length; i++ ) {
        theData = theData[ident[i]];
    }

    return theData;
}

function evaluateTemplate_deepCopy(obj) {
    // TODO:
    var n = {};
    for ( var k in obj ) {
        n[k] = obj[k];
    }
    return n;
}

function evaluateTemplate_pp(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function evaluateTemplate(theTemplate, data, scope) {
    if ( !theTemplate ) {
        return "";
    }
    
    switch (theTemplate.type) {
    case "TextNode":
        return theTemplate.text;
        
    case "ListNode":
        var s = "";
        for ( var i = 0; i < theTemplate.nodes.length; i++ ) {
            s += evaluateTemplate(theTemplate.nodes[i], data, scope)
        }
        return s

    case "ActionNode":
        return evaluateTemplate(theTemplate.pipe, data, scope)

    case "PipeNode":
        if (theTemplate.isAssign) {
            throw "can't handle isAssign=true yet";
        }

        if (theTemplate.decl.length > 0) {
            throw "can't handle decl yet";
        }

        if (theTemplate.cmds.length != 1)  {
            throw "can only handle 1 cmd";
        }

        return evaluateTemplate(theTemplate.cmds[0], data, scope)

    case "CommandNode":
        if (theTemplate.args.length != 1) {
            throw "CommandNode still anemic";
        }

        return evaluateTemplate(theTemplate.args[0], data, scope)

    case "FieldNode":
        return evaluateTemplate_getField(data, theTemplate.ident)

    case "VariableNode":
        return evaluateTemplate_getField(scope, theTemplate.ident)
        
    case "IfNode":
        var x = evaluateTemplate(theTemplate.pipe, data, scope);
        if ( x ) {
            return evaluateTemplate(theTemplate.list, data, scope);
        } else {
            return evaluateTemplate(theTemplate["else"], data, scope);
        }

    case "RangeNode":

        if ( theTemplate["else"].nodes.length > 0 ) {
            throw "RangeNode.else not supported yet";
        }

        var pipe = theTemplate["pipe"];
        if ( pipe.cmds.length != 1 || pipe.decl.length != 1 ) {
            throw "RangeNode only supports 1 cmd and 1 decl for now";
        }

        if (pipe.decl[0].type != "VariableNode" || pipe.decl[0].ident.length != 1 ) {
            throw "RangeNode is anemic";
        }
        
        var rangeOver = evaluateTemplate(pipe.cmds[0], data, scope);

        var s = "";
        for ( var i = 0; i < rangeOver.length; i++ ) {
            var x = rangeOver[i];
            var scope = {};
            scope[pipe.decl[0].ident[0]] = x;
            var ss = evaluateTemplate(theTemplate.list, data, scope);
            s += ss;
        }
        return s;
        
    default:
        evaluateTemplate_pp(theTemplate);
        throw "can't handle node type: " + theTemplate.type;
    }

}
