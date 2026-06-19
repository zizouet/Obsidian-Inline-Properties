import { FC } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { ViewUpdate } from '@codemirror/view';

interface CodeEditorProps {
	value?: string;
	onChange?: (val: string, viewUpdate: ViewUpdate) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({ value, onChange }) => {
	return (
		<CodeMirror theme="dark" value={value} basicSetup onChange={onChange} />
	);
};

export default CodeEditor;
