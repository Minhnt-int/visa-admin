"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import { CustomUploadAdapterPlugin } from './uploadAdapter';

/**
 * This is a 24-hour evaluation key. Create a free account to use CDN: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzQ5MTUxOTksImp0aSI6IjJjYjFjYzgwLTFmMWItNGEyOC1hMjFlLTYwNGEwZjZkZTE1NyIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIiE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIl0sInZjIjoiODE2NjBjZWEifQ.hM4dHg0T2smRK_IoDM8s3UNGEfPoe33PWe4Uo9GCIW3HZN0tbIPXZMXL2Mat9Crith_8YBdjOBeAbgA5f1PThA';

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
	const cloud = useCKEditorCloud({ version: '44.3.0', translations: ['vi'] });

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const deleteImageFromServer = (src : any) => {
		// Implement API call to delete image from server
	};

	const { ClassicEditor, DecoupledEditor, Plugin, ButtonView, AutoLink, CKBox, CKBoxImageEdit, Code, ImageEditing, ImageUtils, PageBreak, PictureEditing, Strikethrough, Subscript, Superscript, editorConfig } = useMemo(() => {
		if (cloud.status !== 'success' || !isLayoutReady) {
			return {};
		}

		const {
			ClassicEditor,
			DecoupledEditor,
			Plugin,
			ButtonView,
			AutoLink,
			CKBox,
			CKBoxImageEdit,
			Code,
			ImageEditing,
			ImageUtils,
			PageBreak,
			PictureEditing,
			Strikethrough,
			Subscript,
			Superscript,
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
			 Underline,
			 WordCount
		} = cloud.CKEditor;

		return {
			ClassicEditor,
			DecoupledEditor,
			Plugin,
			ButtonView,
			AutoLink,
			CKBox,
			CKBoxImageEdit,
			Code,
			ImageEditing,
			ImageUtils,
			PageBreak,
			PictureEditing,
			Strikethrough,
			Subscript,
			Superscript,
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
					Underline,
					WordCount,
					ImageUtils,
				],
				extraPlugins: [CustomUploadAdapterPlugin],
				imageInsertViaUrl: {
					// Có thể tùy chỉnh placeholder cho URL input
					placeholder: 'Nhập URL hình ảnh ở đây...',
					
					// Mặc định cho phép insert image via URL
					isEnabled: true
				  },
				// balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
				balloonToolbar: [ 'bold', 'italic', 'undo', 'redo' ],
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
				disableCheck: true,
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
				placeholder: placeholder,
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
				},
				wordCount: {
					displayWords: true,
					displayCharacters: true,
					onUpdate: (stats: any) => {
						setWordStats(stats);
					}
				},
				htmlSupport: {
					allow: [
						{
							name: /.*/,
							attributes: {
								all: true
							},
							classes: {
								'*': true
							},
							styles: {
								'*': true
							}
						}
					]
				}
			}
		};
	}, [cloud, isLayoutReady, value, placeholder]);

	return (
		<>
			<div className="editor-container editor-container_classic-editor editor-container_include-style" 
				 ref={editorContainerRef}>
				<div className="editor-container__editor">
					<div ref={editorRef}>
						{ClassicEditor && editorConfig && (
							<CKEditor 
								editor={ClassicEditor} 
								config={editorConfig}
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