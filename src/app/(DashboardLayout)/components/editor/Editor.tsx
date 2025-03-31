/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoNgNARATAdAzPCkQBYCsB2NBOAjFDEKADhGKim2xThDJVLTJDTRQwxqiQgDcBLJAAYwwXGHEjx0gLqQU7XLQDGEGUA=
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import { CustomUploadAdapterPlugin } from './uploadAdapter';
import '@/styles/editor.css';   

/**
 * This is a 24-hour evaluation key. Create a free account to use CDN: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDM0NjU1OTksImp0aSI6IjI2NzFiZmMwLTVjOTEtNGM2YS1iMGNhLTFkM2Q2YmE2Mjk2YiIsImxpY2Vuc2VkSG9zdHMiOlsiKi53ZWJjb250YWluZXIuaW8iLCIqLmpzaGVsbC5uZXQiLCIqLmNzcC5hcHAiLCJjZHBuLmlvIiwiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIiwic2giXSwibGljZW5zZVR5cGUiOiJldmFsdWF0aW9uIiwidmMiOiJmZjE1NDA5MiJ9.i4pbllIBtt50X0lcH2xtYFO6CJzcUbVSwfJKr-5Gxow8GHmSBAULytvDN9Mi4UX1cVF7CXkdxFQghgQKp0Y2jw';

interface EditorProps {
    disabled?: boolean;
    onChange?: (content: string) => void;
    value?: string;
}

export default function Editor({ disabled = false, onChange, value }: EditorProps) {
	const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [editorInstance, setEditorInstance] = useState(null);
	const cloud = useCKEditorCloud({ version: '44.3.0', translations: ['vi'] });

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const deleteImageFromServer = (src : any) => {
		// Implement API call to delete image from server
		console.log(`Deleting image from server: ${src}`);
	};

	const { ClassicEditor, editorConfig } = useMemo(() => {
		if (cloud.status !== 'success' || !isLayoutReady) {
			return {};
		}

		const {
			ClassicEditor,
			Alignment,
			Autoformat,
			AutoImage,
			Autosave,
			BalloonToolbar,
			BlockQuote,
			Bold,
			Bookmark,
			CloudServices,
			CodeBlock,
			Emoji,
			Essentials,
			FindAndReplace,
			FontBackgroundColor,
			FontColor,
			FontFamily,
			FontSize,
			FullPage,
			GeneralHtmlSupport,
			Heading,
			Highlight,
			HorizontalLine,
			HtmlComment,
			HtmlEmbed,
			ImageBlock,
			ImageCaption,
			ImageInline,
			ImageInsert,
			ImageInsertViaUrl,
			ImageResize,
			ImageStyle,
			ImageTextAlternative,
			ImageToolbar,
			ImageUpload,
			Indent,
			IndentBlock,
			Italic,
			Link,
			LinkImage,
			List,
			ListProperties,
			Markdown,
			MediaEmbed,
			Mention,
			Paragraph,
			PasteFromMarkdownExperimental,
			PasteFromOffice,
			RemoveFormat,
			ShowBlocks,
			SimpleUploadAdapter,
			SourceEditing,
			SpecialCharacters,
			SpecialCharactersArrows,
			SpecialCharactersCurrency,
			SpecialCharactersEssentials,
			SpecialCharactersLatin,
			SpecialCharactersMathematical,
			SpecialCharactersText,
			Style,
			Table,
			TableCaption,
			TableCellProperties,
			TableColumnResize,
			TableProperties,
			TableToolbar,
			TextTransformation,
			TodoList,
			 Underline
		} = cloud.CKEditor;

		return {
			ClassicEditor,
			editorConfig: {
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
				plugins: [
					Alignment,
					Autoformat,
					AutoImage,
					Autosave,
					BalloonToolbar,
					BlockQuote,
					Bold,
					Bookmark,
					CloudServices,
					CodeBlock,
					Emoji,
					Essentials,
					FindAndReplace,
					FontBackgroundColor,
					FontColor,
					FontFamily,
					FontSize,
					FullPage,
					GeneralHtmlSupport,
					Heading,
					Highlight,
					HorizontalLine,
					HtmlComment,
					HtmlEmbed,
					ImageBlock,
					ImageCaption,
					ImageInline,
					ImageInsert,
					ImageInsertViaUrl,
					ImageResize,
					ImageStyle,
					ImageTextAlternative,
					ImageToolbar,
					ImageUpload,
					Indent,
					IndentBlock,
					Italic,
					Link,
					LinkImage,
					List,
					ListProperties,
					Markdown,
					MediaEmbed,
					Mention,
					Paragraph,
					PasteFromMarkdownExperimental,
					PasteFromOffice,
					RemoveFormat,
					ShowBlocks,
					SimpleUploadAdapter,
					SourceEditing,
					SpecialCharacters,
					SpecialCharactersArrows,
					SpecialCharactersCurrency,
					SpecialCharactersEssentials,
					SpecialCharactersLatin,
					SpecialCharactersMathematical,
					SpecialCharactersText,
					Style,
					Table,
					TableCaption,
					TableCellProperties,
					TableColumnResize,
					TableProperties,
					TableToolbar,
					TextTransformation,
					TodoList,
					Underline
				],
				extraPlugins: [CustomUploadAdapterPlugin],
				imageInsertViaUrl: {
					// Có thể tùy chỉnh placeholder cho URL input
					placeholder: 'Nhập URL hình ảnh ở đây...',
					
					// Mặc định cho phép insert image via URL
					isEnabled: true
				  },
				balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
				fontFamily: {
					supportAllValues: true
				},
				fontSize: {
					options: [10, 12, 14, 'default', 18, 20, 22],
					supportAllValues: true
				},
				heading: {
					options: [
						{
							model: 'paragraph' as 'paragraph',
							title: 'Paragraph',
							class: 'ck-heading_paragraph'
						},
						{
							model: 'heading1' as 'heading1',
							view: 'h1',
							title: 'Heading 1',
							class: 'ck-heading_heading1'
						},
						{
							model: 'heading2' as 'heading2',
							view: 'h2',
							title: 'Heading 2',
							class: 'ck-heading_heading2'
						},
						{
							model: 'heading3' as 'heading3',
							view: 'h3',
							title: 'Heading 3',
							class: 'ck-heading_heading3'
						},
						{
							model: 'heading4' as 'heading4',
							view: 'h4',
							title: 'Heading 4',
							class: 'ck-heading_heading4'
						},
						{
							model: 'heading5' as 'heading5',
							view: 'h5',
							title: 'Heading 5',
							class: 'ck-heading_heading5'
						},
						{
							model: 'heading6' as 'heading6',
							view: 'h6',
							title: 'Heading 6',
							class: 'ck-heading_heading6'
						}
					]
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true,
							attributes: true,
							classes: true
						}
					]
				},
				image: {
					toolbar: [
						'toggleImageCaption',
						'imageTextAlternative',
						'|',
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText',
						'|',
						'resizeImage'
					]
				},
				initialData: value || '',
				language: 'vi',
				licenseKey: LICENSE_KEY,
				link: {
					addTargetToExternalLinks: true,
					defaultProtocol: 'https://',
					decorators: {
						toggleDownloadable: {
							mode: 'manual',
							label: 'Downloadable',
							attributes: {
								download: 'file'
							}
						}
					}
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
				mention: {
					feeds: [
						{
							marker: '@',
							feed: [
								/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
							]
						}
					]
				},
				menuBar: {
					isVisible: true
				},
				placeholder: 'Nhập đoạn văn bản của bạn ở đây...',
				style: {
					definitions: [
						{
							name: 'Article category',
							element: 'h3',
							classes: ['category']
						},
						{
							name: 'Title',
							element: 'h2',
							classes: ['document-title']
						},
						{
							name: 'Subtitle',
							element: 'h3',
							classes: ['document-subtitle']
						},
						{
							name: 'Info box',
							element: 'p',
							classes: ['info-box']
						},
						{
							name: 'Side quote',
							element: 'blockquote',
							classes: ['side-quote']
						},
						{
							name: 'Marker',
							element: 'span',
							classes: ['marker']
						},
						{
							name: 'Spoiler',
							element: 'span',
							classes: ['spoiler']
						},
						{
							name: 'Code (dark)',
							element: 'pre',
							classes: ['fancy-code', 'fancy-code-dark']
						},
						{
							name: 'Code (bright)',
							element: 'pre',
							classes: ['fancy-code', 'fancy-code-bright']
						}
					]
				},
				table: {
					contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
				}
			}
		};
	}, [cloud, isLayoutReady, value]);

	return (
		<div className="main-container" style={{margin: '20px auto' }}>
			<div className="editor-container editor-container_classic-editor editor-container_include-style" 
				 ref={editorContainerRef}
				 style={{ borderRadius: '8px', padding: '10px' }}>
				<div className="editor-container__editor">
					<div ref={editorRef}>
						{ClassicEditor && editorConfig && (
							<CKEditor 
								editor={ClassicEditor} 
								config={editorConfig}
								disabled={disabled}
								onReady={editor => {
									setEditorInstance(editor);
								}}
								onChange={(event, editor) => {
									const data = editor.getData();
									console.log('Editor content:', data);
									
									// Gọi hàm onChange được truyền vào từ props
									if (onChange) {
										onChange(data);
									}
								}}
							/>
						)}
					</div>
				</div>
			</div>  
		</div>
	);
}
