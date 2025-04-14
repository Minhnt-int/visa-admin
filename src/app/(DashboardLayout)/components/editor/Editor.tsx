/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoNgNARATAdAzPCkQBYCsB2NBOAjFDEKADhGKim2xThDJVLTJDTRQwxqiQgDcBLJAAYwwXGHEjx0gLqQU7XLQDGEGUA=
 */
"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Typography } from "@mui/material";
import '@/styles/editor.css';   

/**
 * This is a 24-hour evaluation key. Create a free account to use CDN: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzQ5MTUxOTksImp0aSI6ImExYTg4NzRiLTY5MWUtNDExYS1hMDUwLWNiNTgxZjUyYjE2YSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCJdLCJ2YyI6ImRiOTA2NGY0In0.3B1mG2nWsF_cM-8grXjCVwwDsm7pUkFPRW0Ipp9E_n-3RWqijme3bpFCcSuUKjmiL4s-QpSBGLyu95CObTULZw'
const CKEditorWrapper = dynamic(
	() => import('./CKEditorWrapper'),
	{
		loading: () => (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
				<CircularProgress />
				<Typography variant="body2" sx={{ ml: 2 }}>
					Đang tải trình soạn thảo...
				</Typography>
			</Box>
		),
		ssr: false // Không render ở server side
	}
);

interface EditorProps {
	disabled?: boolean;
	onChange?: (content: string) => void;
	value?: string;
	placeholder?: string;
}

export default function Editor({ disabled = false, onChange, value, placeholder }: EditorProps) {
	return (
		<div className="main-container">
			<CKEditorWrapper
				disabled={disabled}
				onChange={onChange}
				value={value}
				placeholder={placeholder}
			/>
		</div>
	);
}
