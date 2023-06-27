
import { useState } from 'react';
import { IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import DialogContext from '../Contexts/dialogContext';
import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function DialogProvider(props) {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const [collection, setCollection] = useState({});
	const [isAdmin, setIsAdmin] = useState(false);

	const action = snackbarId => (
		<IconButton onClick={() => closeSnackbar(snackbarId)} sx={{ color: 'inherit' }}>
			<CloseIcon />
		</IconButton>
	);

	const showError = (message) => {
		enqueueSnackbar(message, {
			variant: 'error',
			action,
			autoHideDuration: 4000,
			anchorOrigin: { horizontal: 'right', vertical: 'bottom' }
		});
	}

	const showWarning = (message) => {
		enqueueSnackbar(message, {
			variant: 'warning',
			action,
			autoHideDuration: 4000,
			anchorOrigin: { horizontal: 'right', vertical: 'bottom' }
		});
	}

	const showSuccess = (message) => {
		enqueueSnackbar(message, {
			variant: 'success',
			action,
			autoHideDuration: 4000,
			anchorOrigin: { horizontal: 'right', vertical: 'bottom' }
		});
	}

	const showLoading = (message) => {
		setLoading(true);
		setLoadingMessage(message);
	}

	const hideLoading = () => {
		setLoading(false);
	}


	let context = {
		showError,
		showSuccess,
		showWarning,
		showLoading,
		hideLoading,
		collection,
		setCollection,
		isAdmin,
		setIsAdmin
	};

	return (
		<DialogContext.Provider value={context}>
			{props.children}
			{loading && <Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={loading}
			>
				<CircularProgress color="inherit" />
				&nbsp;&nbsp;{loadingMessage}
			</Backdrop>}
		</DialogContext.Provider>
	);
};