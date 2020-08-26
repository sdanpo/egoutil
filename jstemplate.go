package egoutil

import (
	"fmt"
	"text/template/parse"
)

func spaces(n int) string {
	s := ""
	for x := 0; x < n; x++ {
		s += "\t"
	}
	return s
}

func branchHelper(n parse.BranchNode, m map[string]interface{}) {
	m["pipe"] = nodeToJSON(n.Pipe)
	m["list"] = nodeToJSON(n.List)
	m["else"] = nodeToJSON(n.ElseList)
}

func nodeToJSON(node parse.Node) map[string]interface{} {
	if node == nil {
		return nil
	}

	m := map[string]interface{}{"type": fmt.Sprintf("%T", node)[7:]}

	switch n := node.(type) {
	case *parse.ListNode:
		nodes := []map[string]interface{}{}
		if n != nil && n.Nodes != nil {
			for _, c := range n.Nodes {
				nodes = append(nodes, nodeToJSON(c))
			}
		}
		m["nodes"] = nodes

	case *parse.TextNode:
		m["text"] = n.String()

	case *parse.ActionNode:
		m["pipe"] = nodeToJSON(n.Pipe)

	case *parse.PipeNode:
		m["isAssign"] = n.IsAssign

		nodes := []map[string]interface{}{}
		for _, d := range n.Decl {
			nodes = append(nodes, nodeToJSON(d))
		}
		m["decl"] = nodes

		nodes = []map[string]interface{}{}
		for _, c := range n.Cmds {
			nodes = append(nodes, nodeToJSON(c))
		}
		m["cmds"] = nodes

	case *parse.FieldNode:
		ident := []string{}
		for _, s := range n.Ident {
			ident = append(ident, s)
		}
		m["ident"] = ident

	case *parse.VariableNode:
		ident := []string{}
		for _, s := range n.Ident {
			ident = append(ident, s)
		}
		m["ident"] = ident

	case *parse.CommandNode:
		args := []map[string]interface{}{}
		for _, a := range n.Args {
			args = append(args, nodeToJSON(a))
		}
		m["args"] = args

	case *parse.IfNode:
		branchHelper(n.BranchNode, m)

	case *parse.RangeNode:
		branchHelper(n.BranchNode, m)

	default:
		panic(fmt.Errorf("unknown type: %T\n%#v", n, n))
	}

	return m
}
