import { useCallback, useState } from 'react';
import { createEditor, BaseEditor, Descendant, Transforms, Editor, Element } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';

type CustomElement = { type: string; children: CustomText[] };
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '&') {
      e.preventDefault();
      editor.insertText('and');
    }
    if (e.key === '`' && e.ctrlKey) {
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

    }
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        placeholder='Enter some text...'
        onKeyDown={handleKeyDown}
        renderElement={renderElement}
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
}

export default App;