// Custom ESLint plugin to check for inline styles with allow-tag comment
// This plugin checks if inline styles have the required comment above them
// Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)

module.exports = {
  rules: {
    "no-inline-style-without-allow": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow inline styles without allow-tag comment with reason",
          category: "Best Practices",
          recommended: true,
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        const sourceCode = context.getSourceCode();

        function checkInlineStyle(node) {
          // Check if this is a style attribute
          if (node.name && node.name.name === "style") {
            // Get all comments before this node (within 2 lines)
            const comments = sourceCode.getCommentsBefore(node);
            
            // Check if there's a comment with the allow-tag and reason
            // Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
            const allowTagPattern = /inline-style:\s*allowed\s*\(reason:\s*(drag\/resize|layout-calc|performance)\)/i;
            
            const hasAllowComment = comments.some((comment) => {
              const commentText = sourceCode.getText(comment);
              return allowTagPattern.test(commentText);
            });

            if (!hasAllowComment) {
              context.report({
                node,
                message:
                  "Inline styles are not allowed. Use CSS classes or SCSS mixins instead. For whitelist cases, add: // inline-style: allowed (reason: drag/resize|layout-calc|performance)",
              });
            }
          }
        }

        return {
          JSXAttribute: checkInlineStyle,
        };
      },
    },
  },
};
