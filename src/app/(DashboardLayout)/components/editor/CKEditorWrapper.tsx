"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CustomUploadAdapterPlugin } from './uploadAdapter';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
  disabled?: boolean;
  onChange?: (content: string) => void;
  value?: string;
  placeholder?: string;
}

export default function CKEditorWrapper({ disabled = false, onChange, value, placeholder }: CKEditorWrapperProps) {
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [editorInstance, setEditorInstance] = useState(null);
	const [wordStats, setWordStats] = useState({ words: 0, characters: 0 });

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const deleteImageFromServer = (src : any) => {
		// Implement API call to delete image from server
	};

	const editorConfig = useMemo(() => {
		if (!isLayoutReady) return null;
		return {
			toolbar: {
				items: [
					'sourceEditing',
					'showBlocks',
					'findAndReplace',
					'|',
					'heading',
					'style',
					'|',
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'bold',
					'italic',
					'underline',
					'removeFormat',
					'|',
					'emoji',
					'specialCharacters',
					'horizontalLine',
					'link',
					'bookmark',
					'insertImage',
					'insertImageViaUrl',
					'mediaEmbed',
					'insertTable',
					'highlight',
					'blockQuote',
					'codeBlock',
					'htmlEmbed',
					'|',
					'alignment',
					'|',
					'bulletedList',
					'numberedList',
					'todoList',
					'outdent',
					'indent',
					'imageTextAlternative'
				],
				shouldNotGroupWhenFull: false
			},
			extraPlugins: [CustomUploadAdapterPlugin],
			initialData: value || '',
			placeholder,
			language: 'vi',
			wordCount: {
				displayWords: true,
				displayCharacters: true,
				onUpdate: (stats: any) => setWordStats(stats),
			},
			htmlSupport: {
				allow: [
					{
						name: /.*/,
						attributes: { all: true },
						classes: { '*': true },
						styles: { '*': true },
					},
				],
			}
		};
	}, [isLayoutReady, value, placeholder]);

	return (
		<>
			<div className="editor-container editor-container_classic-editor editor-container_include-style" 
				 ref={editorContainerRef}>
				<div className="editor-container__editor">
					<div ref={editorRef}>
						{ClassicEditor && editorConfig && (
							<CKEditor 
								editor={ClassicEditor as any} 
								config={editorConfig as any}
								disabled={disabled}
								onReady={(editor: any) => {
									setEditorInstance(editor);
								}}
								onChange={(event, editor) => {
									const data = editor.getData();
									if (onChange) {
										onChange(data);
									}
								}}
							/>
						)}
					</div>
				</div>
			</div>  
			<div style={{ 
				marginTop: '8px', 
				textAlign: 'right', 
				fontSize: '14px', 
				color: '#555' 
			}}>
				Số từ: {wordStats.words} | Số ký tự: {wordStats.characters}
			</div>
		</>
	);
}