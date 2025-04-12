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
const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzQ5MTUxOTksImp0aSI6IjJjYjFjYzgwLTFmMWItNGEyOC1hMjFlLTYwNGEwZjZkZTE1NyIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIiE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIl0sInZjIjoiODE2NjBjZWEifQ.hM4dHg0T2smRK_IoDM8s3UNGEfPoe33PWe4Uo9GCIW3HZN0tbIPXZMXL2Mat9Crith_8YBdjOBeAbgA5f1PThA';

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
