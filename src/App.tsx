import { useCallback, useState } from 'react';
import { createEditor, BaseEditor, Descendant, Transforms, Editor, Element } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';

type CustomElement = { type: string | null; children: CustomElement[] | CustomText[] };
type CustomText = { text: string, bold?: boolean };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
};

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: n => Element.isElement(n) && n.type === 'code',
    });
    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, 'bold');
    } else {
      Editor.addMark(editor, 'bold', true);
    }
  },

  toggleCodeBlock(editor: Editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
}

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
          CustomEditor.toggleCodeBlock(editor);
          break;
        }
  
        case 'b': {
          e.preventDefault();
          CustomEditor.toggleBoldMark(editor);
          break;
        }
      }
    }
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <div>
        <button
          onMouseDown={e => {
            e.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={e => {
            e.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
      </div>
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