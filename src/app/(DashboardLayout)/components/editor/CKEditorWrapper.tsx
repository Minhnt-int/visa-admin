"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CustomUploadAdapterPlugin } from './uploadAdapter';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import MediaPopup from '../popup/MediaPopup';
import { ProductMedia } from '@/data/ProductAttributes';
import { Button, Box } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

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
	const [editorInstance, setEditorInstance] = useState<any>(null);
	const [wordStats, setWordStats] = useState({ words: 0, characters: 0 });
	const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	// Update editor content when value prop changes
	useEffect(() => {
		if (editorInstance && value !== undefined) {
			const currentData = editorInstance.getData();
			if (currentData !== value) {
				editorInstance.setData(value || '');
			}
		}
	}, [editorInstance, value]);


	// Handle media selection from MediaPopup
	const handleMediaSelect = (media: ProductMedia) => {
		if (!editorInstance) return;

		// Build full URL - MediaPopup trả về URL đã có format /api/media/serve/...
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
		// URL từ API đã có format /api/media/serve/filename.jpg
		const imageUrl = media.url.startsWith('http') 
			? media.url 
			: media.url.startsWith('/') 
				? `${apiUrl}${media.url}` 
				: `${apiUrl}/api/media/serve/${media.url}`;
		
		// Insert image into editor
		editorInstance.model.change((writer: any) => {
			const imageElement = writer.createElement('imageBlock', {
				src: imageUrl,
				alt: media.altText || media.name || ''
			});

			// Insert at current selection position
			editorInstance.model.insertContent(imageElement, editorInstance.model.document.selection);
		});

		setIsMediaPopupOpen(false);
	};

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
			{/* Button để mở Media Library - đặt ngay trên toolbar */}
			<Box sx={{ 
				mb: 1, 
				display: 'flex', 
				justifyContent: 'flex-end',
				gap: 1
			}}>
				<Button
					variant="outlined"
					size="small"
					startIcon={<ImageIcon />}
					onClick={() => setIsMediaPopupOpen(true)}
					sx={{
						textTransform: 'none',
						fontSize: '14px'
					}}
				>
					Thư viện ảnh
				</Button>
			</Box>
			
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

			{/* Media Library Popup */}
			<MediaPopup
				open={isMediaPopupOpen}
				onClose={() => setIsMediaPopupOpen(false)}
				onSelect={handleMediaSelect}
				listMedia={[]} // MediaPopup sẽ tự fetch media từ API
				onSubmit={() => {}}
				isView={false}
			/>
		</>
	);
}