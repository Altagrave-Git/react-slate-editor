import { useCallback, useState } from 'react';
import { createEditor, BaseEditor, Descendant, Transforms, Editor, Element } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';

type CustomElement = { type: string; children: CustomElement[] | CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Example text in a paragraph node.' }],
  },
];

const App = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '&') {
      e.preventDefault();
      editor.insertText('and');
    }
    if (e.key && e.ctrlKey) {
      switch (e.key) {
        case '`': {
          e.preventDefault();
          // Determine whether any of the currently selected blocks are code blocks
          const [match] = Editor.nodes(editor, {
            match: n => Element.isElement(n) && n.type === 'code',
          })
          // Toggle the block type depending on whether there's already a match.
          Transforms.setNodes(
            editor,
            { type: match ? 'paragraph' : 'code' },
            { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
          )
          break;
        }
  
        case 'b': {
          e.preventDefault();
          Editor.addMark(editor, 'bold', true);
          break;
        }
      }
    }
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        placeholder='Enter some text...'
        onKeyDown={handleKeyDown}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck={false}
      />
    </Slate>
  )
};

const DefaultElement = (props: any) => {
  return <p {...props.attributes}>{props.children}</p>
};

const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
};

const Leaf = ({attributes, children, leaf}: any) => {
  return (
    <span
      {...attributes}
      style={{
        fontWeight: leaf.bold ? '700' : '400',
        fontStyle: leaf.italic ? 'italic' : 'normal',
      }}
    >
      {children}
    </span>
  )
};

export default App;